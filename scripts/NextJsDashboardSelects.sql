/*
    NextJS Dashboard SELECTS
*/
SELECT  *
FROM    Customers

SELECT  *
FROM    Users

SELECT  *
FROM    Invoices

SELECT  I.Amount
        , C.[Name]
FROM    Invoices AS I
        INNER JOIN Customers AS C 
            ON I.CustomerId = C.Id
WHERE   I.Amount = 666;

SELECT  TOP 5 
              I.Amount
              , C.Name
              , C.ImageUrl
              , C.Email
              , I.Id
      FROM    Invoices AS I
              INNER JOIN Customers AS C
                ON I.CustomerId = C.id
      ORDER BY I.Date DESC

      SELECT  SUM(CASE WHEN status = 'paid' THEN Amount ELSE 0 END) AS "paid"
              , SUM(CASE WHEN status = 'pending' THEN Amount ELSE 0 END) AS "pending"
      FROM    Invoices


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
    --   WHERE   C.name LIKE ${`%${query}%`} OR
    --           C.Email LIKE ${`%${query}%`} OR
    --     -- I.Amount::text ILIKE ${`%${query}%`} OR
    --     -- I.date::text ILIKE ${`%${query}%`} OR
    --         I.status LIKE ${`%${query}%`}
      ORDER BY I.date DESC
      OFFSET 1 ROWS 
      FETCH NEXT 5 ROWS ONLY


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
    --   WHERE   C.Name LIKE ${`%${query}%`} OR
    --           C.Email LIKE ${`%${query}%`}
      GROUP BY C.Id
              , C.Name
              , C.Email
              , C.ImageUrl
      ORDER BY C.Name ASC