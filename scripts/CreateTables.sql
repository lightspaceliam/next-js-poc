/*
    NextJS Dashboard Create Tables
*/

-- USE master
-- GO
-- IF DB_ID(N'NextJsDashboard') IS NOT NULL
-- 	DROP DATABASE NextJsDashboard;
-- GO

-- CREATE DATABASE NextJsDashboard
-- COLLATE SQL_Latin1_General_CP1_CI_AS;

-- DROP TABLE Users
-- DROP TABLE Invoices
-- DROP TABLE Customers
-- DROP TABLE Revenue

CREATE TABLE Users (
    Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    [Name] NVARCHAR(255) NOT NULL,
    [Email] NVARCHAR(255) NOT NULL UNIQUE,
    [Password] NVARCHAR(255) NOT NULL
);

CREATE TABLE Customers (
    Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    [Name] VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    ImageUrl VARCHAR(255) NOT NULL
);

CREATE TABLE Invoices (
    Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Amount INT NOT NULL,
    [Status] VARCHAR(255) NOT NULL,
    [Date] DATETIME2 NOT NULL,
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
);



CREATE TABLE Revenue (
    [Month] VARCHAR(4) NOT NULL UNIQUE,
    Revenue INT NOT NULL
);