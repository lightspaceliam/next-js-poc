// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  Id: string;
  Name: string;
  Email: string;
  Password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: 'pending' | 'paid';
};

//  Capitalize because of our Db column name convention if we. If we had an API we wouldn't need to do this.
export type Revenue = {
  Month: string;
  Revenue: number;
};

export type LatestInvoice = {
  Id: string;
  Name: string;
  ImageUrl: string;
  Email: string;
  Amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'Amount'> & {
  Amount: number;
};

export type InvoicesTable = {
  Id: string;
  CustomerId: string;
  Name: string;
  Email: string;
  ImageUrl: string;
  Date: string;
  Amount: number;
  Status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  Id: string;
  Name: string;
};

export type InvoiceForm = {
  Id: string;
  CustomerId: string;
  Amount: number;
  Status: 'pending' | 'paid';
};
