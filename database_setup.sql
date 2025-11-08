-- Insert sample data for Peace International application
-- Run this after EF migrations have created the database schema

-- Insert Sectors
INSERT INTO Sector (Name, Code, CreatedBy, CreatedDate) VALUES
('Jerusalem', 'JRS', 'superadmin', NOW()),
('Dead Sea', 'DS', 'superadmin', NOW()),
('Bethlehem', 'BTH', 'superadmin', NOW()),
('Jericho', 'JRC', 'superadmin', NOW()),
('Nazareth', 'NZR', 'superadmin', NOW());

-- Insert Hotels
INSERT INTO Hotel (Name, PhoneNo, Address, Code, Category, CreatedBy, CreatedDate) VALUES
('Grand Palace Hotel', '+972-2-555-0001', 'Sultan Suleiman St, Jerusalem', 'GPH', 'A', 'superadmin', NOW()),
('Dead Sea Resort', '+972-8-555-0002', 'Ein Bokek Beach, Dead Sea', 'DSR', 'A', 'superadmin', NOW()),
('Bethlehem Inn', '+972-2-555-0003', 'Manger Square, Bethlehem', 'BTI', 'B', 'superadmin', NOW()),
('Jericho Oasis Hotel', '+972-2-555-0004', 'Ein Sultan St, Jericho', 'JOH', 'B', 'superadmin', NOW()),
('Nazareth Plaza', '+972-4-555-0005', 'Mary\'s Well Square, Nazareth', 'NZP', 'C', 'superadmin', NOW());

-- Insert Hotel Room Rates
INSERT INTO HotelRoomRate (HotelId, SingleBed, DoubleBed, ExtraBed, AP, MAP, CreatedBy, CreatedDate) VALUES
(1, 120.00, 180.00, 40.00, 25.00, 15.00, 'superadmin', NOW()),
(2, 150.00, 220.00, 50.00, 30.00, 20.00, 'superadmin', NOW()),
(3, 80.00, 120.00, 30.00, 20.00, 12.00, 'superadmin', NOW()),
(4, 90.00, 140.00, 35.00, 22.00, 13.00, 'superadmin', NOW()),
(5, 60.00, 90.00, 25.00, 18.00, 10.00, 'superadmin', NOW());

-- Insert Guides
INSERT INTO Guide (Name, FullDayRate, HalfDayRate, OverNight, CreatedBy, CreatedDate) VALUES
('Youssef Ibrahim', 150.00, 80.00, 200.00, 'superadmin', NOW()),
('Sarah Cohen', 160.00, 85.00, 210.00, 'superadmin', NOW()),
('Omar Khalil', 140.00, 75.00, 190.00, 'superadmin', NOW()),
('Rachel Levy', 145.00, 78.00, 195.00, 'superadmin', NOW()),
('Mahmoud Ali', 135.00, 72.00, 185.00, 'superadmin', NOW());

-- Insert Sector Transport
INSERT INTO SectorTransport (SectorId, TransportId, Cost, CreatedBy, CreatedDate) VALUES
(1, 1, 50.00, 'superadmin', NOW()),
(1, 2, 80.00, 'superadmin', NOW()),
(1, 3, 120.00, 'superadmin', NOW()),
(2, 1, 70.00, 'superadmin', NOW()),
(2, 2, 100.00, 'superadmin', NOW()),
(2, 3, 150.00, 'superadmin', NOW()),
(3, 1, 45.00, 'superadmin', NOW()),
(3, 2, 75.00, 'superadmin', NOW()),
(4, 1, 55.00, 'superadmin', NOW()),
(4, 2, 85.00, 'superadmin', NOW()),
(5, 1, 60.00, 'superadmin', NOW()),
(5, 2, 90.00, 'superadmin', NOW());

-- Insert Customers
INSERT INTO Customer (FiscalYearId, FileCodeNo, TourName, Country, ArrivalDate, DepartureDate, Agent, AgentStaff, GuideName, CreatedBy, CreatedDate) VALUES
(1, '7677/0001', 'HOLY LAND TOUR', 'USA', '2024-03-15', '2024-03-22', 'Travel Agency Inc', 'John Smith', 'Youssef Ibrahim', 'superadmin', NOW()),
(1, '7677/0002', 'JERUSALEM HERITAGE', 'SPAIN', '2024-04-10', '2024-04-17', 'Euro Tours', 'Maria Garcia', 'Sarah Cohen', 'superadmin', NOW()),
(1, '7677/0003', 'BIBLICAL SITES TOUR', 'CHINA', '2024-05-05', '2024-05-12', 'Asia Travel', 'David Chen', 'Omar Khalil', 'superadmin', NOW()),
(1, '7677/0004', 'DEAD SEA EXPERIENCE', 'UK', '2024-06-01', '2024-06-08', 'British Tours Ltd', 'Emma Wilson', 'Rachel Levy', 'superadmin', NOW()),
(1, '7677/0005', 'ANCIENT JERICHO', 'EGYPT', '2024-07-15', '2024-07-22', 'Nile Travel', 'Ahmed Hassan', 'Mahmoud Ali', 'superadmin', NOW()),
(2, '7778/0001', 'GALILEE ADVENTURE', 'FRANCE', '2024-08-10', '2024-08-17', 'Paris Travel', 'Pierre Dubois', 'Youssef Ibrahim', 'superadmin', NOW()),
(2, '7778/0002', 'BETHLEHEM PILGRIMAGE', 'ITALY', '2024-09-05', '2024-09-12', 'Roma Tours', 'Giuseppe Rossi', 'Sarah Cohen', 'superadmin', NOW());

-- Insert Tour Costs
INSERT INTO Tourcost (ClientName, MinPAX, MaxPAX, Days, Category1, Category2, Category3, GuideId, MealType, IsLuxury, GuideDaysHalfDay, GuideDaysFullDay, GuideDaysEscort, DiscountTransportation, DiscountAccomodation, Comment, CreatedBy, CreatedDate) VALUES
('Travel Agency Inc', 2, 5, 7, 'A', 'B', 'C', 1, 'Full Board', 0, 2, 5, 0, 10, 15, 'Standard package', 'superadmin', NOW()),
('Euro Tours', 6, 10, 7, 'A', 'A', 'B', 2, 'Half Board', 1, 1, 6, 0, 5, 10, 'Luxury package', 'superadmin', NOW()),
('Asia Travel', 10, 15, 5, 'B', 'B', 'C', 3, 'Breakfast Only', 0, 0, 5, 0, 15, 20, 'Budget package', 'superadmin', NOW());

-- Insert Tour Cost Details
INSERT INTO TourcostDetail (Day, TourcostId, Sector1Id, Sector2Id, HotelAId, HotelBId, HotelCId, Category1Cost, Category2Cost, Category3Cost, CreatedBy, CreatedDate) VALUES
('Day 1', 1, 1, NULL, 1, 3, 5, 180.00, 120.00, 90.00, 'superadmin', NOW()),
('Day 2', 1, 1, 2, 1, 3, 5, 200.00, 140.00, 100.00, 'superadmin', NOW()),
('Day 3', 1, 2, NULL, 2, 4, 5, 220.00, 150.00, 110.00, 'superadmin', NOW()),
('Day 1', 2, 1, NULL, 1, 1, 3, 250.00, 250.00, 150.00, 'superadmin', NOW()),
('Day 2', 2, 3, NULL, 3, 3, 5, 180.00, 180.00, 120.00, 'superadmin', NOW()),
('Day 1', 3, 4, NULL, 4, 4, 5, 140.00, 140.00, 100.00, 'superadmin', NOW()),
('Day 2', 3, 1, 5, 1, 3, 5, 160.00, 130.00, 95.00, 'superadmin', NOW());

-- Insert Invoices
INSERT INTO Invoice (InvoiceNo, IsTicket, FileCodeNo, FiscalYearId, ReferenceNo, Dr, Address, ClientName, Currency, PAX, Guide, Vehicle, TotalDue, Discount, NetAmount, CreatedBy, CreatedDate) VALUES
('INV-001', 0, '7677/0001', 1, 'REF-001', 'Travel Agency Inc', '123 Main St, New York, USA', 'John Smith', 'USD', 4, 'Youssef Ibrahim', 'T3', 2800.00, 200.00, 2600.00, 'superadmin', NOW()),
('INV-002', 0, '7677/0002', 1, 'REF-002', 'Euro Tours', '456 Gran Via, Madrid, Spain', 'Maria Garcia', 'EUR', 8, 'Sarah Cohen', 'T4', 4500.00, 300.00, 4200.00, 'superadmin', NOW()),
('INV-003', 1, '7677/0003', 1, 'REF-003', 'Asia Travel', '789 Beijing Rd, Shanghai, China', 'David Chen', 'USD', 12, 'Omar Khalil', 'T5', 3200.00, 400.00, 2800.00, 'superadmin', NOW());

-- Insert Invoice Details
INSERT INTO InvoiceDetail (InvoiceId, Particulars, Amount, CreatedBy, CreatedDate) VALUES
(1, 'Accommodation - 7 nights', 1400.00, 'superadmin', NOW()),
(1, 'Transportation', 600.00, 'superadmin', NOW()),
(1, 'Guide Services', 800.00, 'superadmin', NOW()),
(2, 'Accommodation - 7 nights', 2200.00, 'superadmin', NOW()),
(2, 'Transportation', 1200.00, 'superadmin', NOW()),
(2, 'Guide Services', 1100.00, 'superadmin', NOW()),
(3, 'Accommodation - 5 nights', 1500.00, 'superadmin', NOW()),
(3, 'Transportation', 900.00, 'superadmin', NOW()),
(3, 'Guide Services', 800.00, 'superadmin', NOW());

-- Insert Service Vouchers
INSERT INTO ServiceVoucher (ExchangeOrderNo, FileCodeNo, FiscalYearId, HotelId, ClientName, PAX, ArrivalDate, `From`, ArrivalFlight, DepartureDate, `To`, DepartureFlight, Services, CreatedBy, CreatedDate) VALUES
('EO-001', '7677/0001', 1, 1, 'John Smith', 4, '2024-03-15 14:30:00', 'Ben Gurion Airport', 'LY001', '2024-03-22 10:00:00', 'Ben Gurion Airport', 'LY002', 'Full Board, Airport Transfer', 'superadmin', NOW()),
('EO-002', '7677/0002', 1, 1, 'Maria Garcia', 8, '2024-04-10 16:00:00', 'Ben Gurion Airport', 'IB345', '2024-04-17 11:30:00', 'Ben Gurion Airport', 'IB346', 'Half Board, City Tour', 'superadmin', NOW()),
('EO-003', '7677/0003', 1, 4, 'David Chen', 12, '2024-05-05 18:00:00', 'Ben Gurion Airport', 'CA123', '2024-05-12 09:00:00', 'Ben Gurion Airport', 'CA124', 'Breakfast Only, Full Day Tour', 'superadmin', NOW());
