 -- Bảng người dùng
CREATE TABLE IF NOT EXISTS User(
     Id INTEGER PRIMARY KEY,
     GoogleId TEXT UNIQUE,
     FacebookId TEXT UNIQUE,
     Email TEXT UNIQUE,
     UserName TEXT UNIQUE,
     Password TEXT,
     Role TEXT CHECK(Role IN('User', 'Admin')) DEFAULT 'User',
     AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
     Status TEXT CHECK(Status IN ('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng chi tiết người dùng
CREATE TABLE IF NOT EXISTS UserInfo(
    Id INTEGER PRIMARY KEY,
    UserId INTEGER REFERENCES User(Id),
    FullName TEXT,
    PhoneNumber TEXT,
    Gender TEXT CHECK(Gender IN('Nam', 'Nữ')) DEFAULT 'Nam',
    DoB TEXT DEFAULT '0001-01-01 00:00:00',
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng địa chỉ nhận hàng
CREATE TABLE IF NOT EXISTS ShippingAddress (
    Id INTEGER PRIMARY KEY,
    UserId INTEGER REFERENCES User(Id),
    FullName TEXT,
    PhoneNumber TEXT,
    AddressLine TEXT,
    AddressType TEXT CHECK(AddressType IN('Văn phòng', 'Nhà riêng')) DEFAULT 'Nhà riêng',
    Country TEXT DEFAULT "Việt Nam",
    IsDefault INTEGER CHECK(IsDefault IN(0, 1)) DEFAULT 0,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng mã xác thực người dùng
CREATE TABLE IF NOT EXISTS AuthToken(
    Id INTEGER PRIMARY KEY,
    UserId INTEGER REFERENCES User(Id),
    Token TEXT UNIQUE,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng danh mục sản phẩm
CREATE TABLE IF NOT EXISTS Categories(
    Id INTEGER PRIMARY KEY,
    CateName TEXT UNIQUE,
    Slugs TEXT UNIQUE,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng thương hiệu sản phẩm
CREATE TABLE IF NOT EXISTS Brands(
    Id INTEGER PRIMARY KEY,
    BrandName TEXT UNIQUE,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng loạt thương hiệu
CREATE TABLE IF NOT EXISTS BrandSeries(
    Id INTEGER PRIMARY KEY,
    BrandId INTEGER REFERENCES Brands(Id),
    SeriesName TEXT UNIQUE,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng sản phẩm
CREATE TABLE IF NOT EXISTS Product(
    Id INTEGER PRIMARY KEY,
    CateId INTEGER REFERENCES Categories(Id),
    BrandId INTEGER REFERENCES Brands(Id),
    BrandSeriesId INTEGER REFERENCES BrandSeries(Id),
    Image TEXT,
    ProdName TEXT UNIQUE,
    Quantity INTEGER DEFAULT 1,
    Price REAL,
    Discount REAL DEFAULT 0,
    Slugs TEXT UNIQUE,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    AtUpdate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng chi tiết sản phẩm
CREATE TABLE IF NOT EXISTS ProductDetails(
    Id INTEGER PRIMARY KEY,
    ProdId INTEGER REFERENCES Product(Id),
    DeviceCfg TEXT,
    Content TEXT,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    AtUpdate TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đánh giá sản phẩm
CREATE TABLE IF NOT EXISTS ProductReviews(
    Id INTEGER PRIMARY KEY,
    ProdId INTEGER REFERENCES Product(Id),
    UserId INTEGER REFERENCES User(Id),
    UserName TEXT,
    Rating INTEGER CHECK (Rating >= 1 AND Rating <= 5),
    Comment TEXT,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng sản phẩm đã xem
CREATE TABLE IF NOT EXISTS ProductViewed(
    Id INTEGER PRIMARY KEY,
    ProdId INTEGER REFERENCES Product(Id),
    UserId INTEGER REFERENCES User(Id),
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng các nhãn sản phẩm
CREATE TABLE IF NOT EXISTS Tags(
    Id INTEGER PRIMARY KEY,
    ProdId INTEGER REFERENCES Product(Id),
    TagName TEXT,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng giỏ hàng
CREATE TABLE IF NOT EXISTS Cart(
    Id INTEGER PRIMARY KEY,
    UserId INTEGER REFERENCES User(Id),
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng chi tiết giỏ hàng
CREATE TABLE IF NOT EXISTS CartItem(
    Id INTEGER PRIMARY KEY,
    CartId INTEGER REFERENCES Cart(Id),
    ProdId INTEGER REFERENCES Product(Id),
    Quantity INTEGER DEFAULT 1,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng phương thức thanh toán
CREATE TABLE IF NOT EXISTS Payments(
    Id INTEGER PRIMARY KEY,
    PayName TEXT,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng đơn vị vận chuyển
CREATE TABLE IF NOT EXISTS Shipment(
    Id INTEGER PRIMARY KEY,
    ShipName TEXT,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Bảng đơn hàng
CREATE TABLE IF NOT EXISTS Orders(
    Id INTEGER PRIMARY KEY,
    UserId INTEGER REFERENCES User(Id),
    PayId INTEGER REFERENCES Payments(Id),
    ShipId INTEGER REFERENCES Shipment(Id),
    TotalPrice REAL DEFAULT 0,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Pending', 'Processing', 'Completed', 'Cancelled')) DEFAULT 'Pending'
);

-- Bảng chi tiết đơn hàng
CREATE TABLE IF NOT EXISTS OrderItems(
    Id INTEGER PRIMARY KEY,
    OrdId INTEGER REFERENCES Orders(Id),
    ProdId INTEGER REFERENCES Product(Id),
    Quantity INT DEFAULT 1,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lịch sử mua hàng
CREATE TABLE IF NOT EXISTS PurchaseHistory(
    Id INTEGER PRIMARY KEY,
    UserId INTEGER REFERENCES User(Id),
    ProdId INTEGER REFERENCES Product(Id),
    Quantity INTEGER DEFAULT 1,
    TotalPrice REAL DEFAULT 0,
    AtCreate TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK(Status IN('Active', 'Inactive')) DEFAULT 'Active'
);

-- Trigger để đảm bảo chỉ có một địa chỉ mặc định cho mỗi User của bảng ShippingAddress
CREATE TRIGGER set_default_address
BEFORE INSERT ON ShippingAddress
FOR EACH ROW
WHEN NEW.IsDefault = 1
BEGIN
    UPDATE ShippingAddress 
    SET IsDefault = 0 
    WHERE UserId = NEW.UserId;
END;

-- Trigger để cập nhật địa chỉ khác khi IsDefault thay đổi của bảng ShippingAddress
CREATE TRIGGER update_default_address
BEFORE UPDATE ON ShippingAddress
FOR EACH ROW
WHEN NEW.IsDefault = 1 AND OLD.IsDefault != NEW.IsDefault
BEGIN
    UPDATE ShippingAddress 
    SET IsDefault = 0 
    WHERE UserId = NEW.UserId AND Id != NEW.Id;
END;

-- Dữ liệu 
INSERT INTO User(Email, UserName, Password, Role) VALUES ('anle@gmail.com', 'anle', '$2a$10$weMkH.qB0S.Nv1Jih.3tTuSmtilJwNGs4GtyMN6rom5rj7.UcezXa', 'Admin');
INSERT INTO UserInfo(UserId, FullName) VALUES(1, 'Thanh An');

INSERT INTO Categories(CateName, Slugs) VALUES('Laptop', 'laptop');
INSERT INTO Categories(CateName, Slugs) VALUES('Laptop Gaming', 'laptop-gaming');
INSERT INTO Categories(CateName, Slugs) VALUES('PC', 'pc');
INSERT INTO Categories(CateName, Slugs) VALUES('PC Gaming', 'pc-gaming');

INSERT INTO Brands(BrandName) VALUES('Apple');
INSERT INTO Brands(BrandName) VALUES('Asus');
INSERT INTO Brands(BrandName) VALUES('Acer');
INSERT INTO Brands(BrandName) VALUES('MSI');
INSERT INTO Brands(BrandName) VALUES('Lenovo');
INSERT INTO Brands(BrandName) VALUES('Dell');
INSERT INTO Brands(BrandName) VALUES('HP');
INSERT INTO Brands(BrandName) VALUES('Gigabyte');
INSERT INTO Brands(BrandName) VALUES('LG');

INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (2, 'VivoBook');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (2, 'ZenBook');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (2, 'Tuf Gaming');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (2, 'ROG');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (3, 'Swift');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (3, 'Nitro');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (3, 'Aspire');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (3, 'Aspire Gaming');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (4, 'Modern');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (4, 'Prestige');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (4, 'Summit');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (5, 'ThinkBook');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (5, 'IdeaPad');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (5, 'IdeaPad Pro');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (5, 'ThinkPad');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (5, 'Yoga');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (6, 'Vostro');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (6, 'Inspiron');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (6, 'XPS');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (6, 'Latitude');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (7, 'Victus');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (7, 'Pavilion');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (7, 'ProBook');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUES (7, 'Envy');