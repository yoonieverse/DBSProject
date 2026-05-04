--  create.sql
CREATE DATABASE IF NOT EXISTS Bookstore;
USE Bookstore;

DROP TABLE IF EXISTS LoyaltyTransaction;
DROP TABLE IF EXISTS BooksPurchased;
DROP TABLE IF EXISTS LoyaltyProgram;
DROP TABLE IF EXISTS Transactions;
DROP TABLE IF EXISTS Wage;
DROP TABLE IF EXISTS Employee;
DROP TABLE IF EXISTS Books;

CREATE TABLE Employee(
EmployeeID  INT  NOT NULL  PRIMARY KEY, 
Fname          VARCHAR(50)   NOT NULL, 
Lname          VARCHAR(50)   NOT NULL, 
Position 	 VARCHAR(255) NOT NULL,
HoursWorked DECIMAL(6,2) NOT NULL

 );

   
CREATE TABLE Books ( 
ISBN VARCHAR(13) NOT NULL PRIMARY KEY,
Title VARCHAR(255) NOT NULL,
Author 	VARCHAR(255) NOT NULL, 
Genre	VARCHAR(50) NULL,
Price	DECIMAL (5, 2) NOT NULL,
NumberInStock INT NOT NULL
);

CREATE TABLE Transactions (
TransactionID INT NOT NULL,
Date DATETIME NOT NULL,
TotalPrice DECIMAL(10,2) NOT NULL,
CardNumber VARCHAR(16) NULL,
AssistingEmployee INT NOT NULL,

CONSTRAINT TransactionsPK
	PRIMARY KEY (TransactionID),
CONSTRAINT EmployeeTransactionsFk
	FOREIGN KEY (AssistingEmployee) REFERENCES Employee(EmployeeID)
	ON DELETE RESTRICT 	ON UPDATE RESTRICT
);

CREATE TABLE Wage(
Position VARCHAR(255) NOT NULL,
Manager INT  NULL,
Wage DECIMAL(10,2)  NOT NULL,

CONSTRAINT WagePK 
	PRIMARY KEY (Position),
CONSTRAINT WageEmployeeFk
	FOREIGN KEY (Manager) REFERENCES Employee(EmployeeID)
);

CREATE TABLE LoyaltyProgram (
CustomerID  INT  NOT NULL PRIMARY KEY,
Fname VARCHAR(50) NOT NULL,
Lname VARCHAR(50) NOT NULL,
TotalPoints DECIMAL(8,2) NOT NULL
);



CREATE TABLE BooksPurchased (
BooksISBN VARCHAR(13)  NOT NULL,
TransactionID INT NOT NULL,
Quantity INT,

CONSTRAINT BooksPurchasedPK
	PRIMARY KEY (BooksISBN, TransactionID),
CONSTRAINT BooksPurchTransactionsFK
	FOREIGN KEY (TransactionID) REFERENCES Transactions(TransactionID),
CONSTRAINT BooksPurchasedBooksFK
	FOREIGN KEY (BooksISBN) REFERENCES Books(ISBN) 

);


CREATE TABLE LoyaltyTransaction (
CustomerID INT NOT NULL,
TransactionID INT NOT NULL,

CONSTRAINT LoyaltyProgramPK
	PRIMARY KEY(CustomerID, TransactionID),
CONSTRAINT LoyaltyProgramCustomerFK
	FOREIGN KEY (CustomerID) REFERENCES LoyaltyProgram(CustomerID),
CONSTRAINT LoyaltyProgramTransactionFK
	FOREIGN KEY (TransactionID) REFERENCES Transactions(TransactionID)
);



