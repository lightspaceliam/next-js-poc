// import { sql } from '@vercel/postgres';
import sql, { ConnectionPool } from 'mssql';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { revenue } from './placeholder-data';

export async function fetchRevenue(): Promise<Array<Revenue>> {
  try {
    const connectionPool: ConnectionPool = await sql.connect(process.env.DB_CONN ?? '');
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await connectionPool
      .request()
      .query<Revenue>`
        SELECT  * 
        FROM    Revenue`;

    // console.log('Data fetch completed after 3 seconds.');
    // console.log(`Rows Affected: ${data.rowsAffected}`);

    await connectionPool.close();

    return data?.recordset;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const connectionPool: ConnectionPool = await sql.connect(process.env.DB_CONN ?? '');
    
    const data = await connectionPool
      .request()
      .query<LatestInvoiceRaw>`
      SELECT  TOP 5 
              I.Amount
              , C.Name
              , C.ImageUrl
              , C.Email
              , I.Id
      FROM    Invoices AS I
              INNER JOIN Customers AS C
                ON I.CustomerId = C.id
      ORDER BY I.Date DESC`;

      await connectionPool.close();
        
    const latestInvoices = data.recordset.map((invoice: LatestInvoiceRaw) => ({
      ...invoice,
      amount: formatCurrency(invoice.Amount),
    }));

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    await sql.connect(process.env.DB_CONN ?? '');
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql.query`SELECT COUNT(*) FROM Invoices`;
    const customerCountPromise = sql.query`SELECT COUNT(*) FROM Customers`;
    const invoiceStatusPromise = sql.query`
      SELECT  SUM(CASE WHEN status = 'paid' THEN Amount ELSE 0 END) AS "paid"
              , SUM(CASE WHEN status = 'pending' THEN Amount ELSE 0 END) AS "pending"
      FROM    Invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].recordset[0].count ?? '0');
    const numberOfCustomers = Number(data[1].recordset[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].recordset[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].recordset[0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  await sql.connect(process.env.DB_CONN ?? '');

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql.query<InvoicesTable>`
      SELECT  I.Id
              , I.Amount
              , I.Date
              , I.Status
              , C.Name
              , C.Email
              , C.ImageUrl
      FROM    Invoices AS I
              INNER JOIN Customers AS C 
                ON I.CustomerId = C.Id
      WHERE   C.name LIKE ${`%${query}%`} OR
              C.Email LIKE ${`%${query}%`} OR
        -- I.Amount::text ILIKE ${`%${query}%`} OR
        -- I.date::text ILIKE ${`%${query}%`} OR
            I.status LIKE ${`%${query}%`}
      ORDER BY I.date DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${ITEMS_PER_PAGE} ROWS ONLY
    `;

    return invoices.recordset;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    await sql.connect(process.env.DB_CONN ?? '');

    const count = await sql.query`
      SELECT  COUNT(*)
      FROM    Invoices AS I
              INNER JOIN JOIN Customers AS C 
                ON I.CustomerId = C.Id
      WHERE   C.Name LIKE ${`%${query}%`} OR
              C.Email LIKE ${`%${query}%`} OR
        -- I.Amount::text ILIKE ${`%${query}%`} OR
        -- I.Date::text ILIKE ${`%${query}%`} OR
              I.Status LIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.recordset[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    await sql.connect(process.env.DB_CONN ?? '');

    const data = await sql.query<InvoiceForm>`
      SELECT  I.Id
              , I.CustomerId
              , I.Amount
              , I.Status
      FROM    Invoices AS I
      WHERE   I.Id = ${id};
    `;

    const invoice = data.recordset.map((invoice: InvoiceForm) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    await sql.connect(process.env.DB_CONN ?? '');
    const data = await sql.query<CustomerField>`
      SELECT  Id
              , Name
      FROM    Customers
      ORDER BY [Name] ASC;
    `;

    const customers = data.recordset;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    await sql.connect(process.env.DB_CONN ?? '');

    const data = await sql.query<CustomersTableType>`
      SELECT  C.Id
              , C.[Name]
              , C.Email
              , C.ImageUrl
              , COUNT(I.Id) AS total_invoices
              , SUM(CASE WHEN I.Status = 'pending' THEN I.Amount ELSE 0 END) AS total_pending
              , SUM(CASE WHEN I.Status = 'paid' THEN I.Amount ELSE 0 END) AS total_paid
      FROM    Customers AS C
              LEFT JOIN Invoices AS I 
                ON C.id = I.CustomerId
      WHERE   C.Name LIKE ${`%${query}%`} OR
              C.Email LIKE ${`%${query}%`}
      GROUP BY C.Id
              , C.Name
              , C.Email
              , C.ImageUrl
      ORDER BY C.Name ASC
	  `;

    const customers = data.recordset.map((customer: CustomersTableType) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
