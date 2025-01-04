import sql from 'mssql';
import bcrypt from 'bcrypt';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

async function seedUsers() {
  
  await sql.connect(process.env.DB_CONN ?? '');
  
  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql.query`
        INSERT INTO Users (Id, Name, Email, Password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword});
      `;
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  await sql.connect(process.env.DB_CONN ?? '');

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => sql.query`
        INSERT INTO Invoices (CustomerId, Amount, Status, Date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date});
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await sql.connect(process.env.DB_CONN ?? '');

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => sql.query`
        INSERT INTO customers (Id, Name, Email, ImageUrl)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url});
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await sql.connect(process.env.DB_CONN ?? '');

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql.query`
        INSERT INTO Revenue (Month, Revenue)
        VALUES (${rev.month}, ${rev.revenue});
      `,
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  // return Response.json({
  //   message:
  //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
  // });
  try {
    // await client.sql`BEGIN`;
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    // await client.sql`COMMIT`;

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    // await client.sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}