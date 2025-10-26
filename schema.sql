    create database saildb
    use saildb;

    CREATE TABLE customer (
        customer_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        date_of_birth DATE NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        phno VARCHAR(15) not NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(50) not NULL,
        state VARCHAR(50) not NULL,
        country VARCHAR(15) not NULL,
        pincode VARCHAR(15) not NULL,
    );

    create table products(
        p_id int primary key AUTO_INCREMENT,
        p_name varchar(50),
        p_price int,
        p_stock int,
        p_descpt varchar(250),
        );

    INSERT INTO products(p_name, p_price, p_descpt)
    VALUES
        ("Lymio Men Jeans", 2499, "Lymio Men Jeans || Men Jeans Pants || Denim Jeans || Baggy Jeans for Men"),
        ("Symbol Premium Fit Flexi", 2599, "Symbol Premium Men's Slim Fit Flexi Waist Casual Pants"),
        ("Symbol Premium Slim Fit", 3999, "Symbol Premium Men's Slim Fit Stretch Knit Pants - Smart Casual | Flexi Waist"),
        ("Lymio Men Cargo", 3999, "Lymio Men Cargo || Men Cargo Pants || Men Cargo Pants Cotton || Cargos for Men"),
        ("TOPLOT Casual", 1599, "TOPLOT Men's Regular Casual Pants"),
        ("CB-COLEBROOK Regular Fit Solid Soft Touch Cotton", 1799, "CB-COLEBROOK Men's Regular Fit Solid Soft Touch Cotton Casual Shirt with Pocket Design with Spread Collar & Full Sleeves"),
        ("Dennis Lingo Slim Fit Casual", 999, "Dennis Lingo Men's Solid Slim Fit Casual Shirt"),
        ("Regrowth Classic Denim", 599, "Regrowth Men Classic Denim Casual Shirt"),
        ("Zombom Cotton Blend Solid Casual", 450, "Zombom Cotton Blend Solid Casual Regular Fit Mandarin/Chinese Collor Short Kurta for Men"),
        ("TAGDO Solid", 1299, "TAGDO Men's Solid Shirt with Chest Pocket Short Sleeve Shirt for Summer Outdoor Activities"),
        ("OLEVS Stainless Steel Luxury Analogue", 99999, "OLEVS Stainless Steel Luxury Analogue Men'S Watch(Green-Gold Dial & Silver & Gold Colored Strap)-Ol85G"),
        ("Noise Canvas Smart Watch", 9999, "Noise Canvas Smart Watch with 1.96 Vivid Display, Functional Crown, BT Calling, 150+ Watch Faces, AI Voice Assistant, Health Suiteᵀᴹ, 100+ Sports Modes, IP67, Upto 7 Days Battery"),
        ("Titan Men's Metropolitan Luxe", 5899, "Titan Men's Metropolitan Luxe: Multifunction Black Dial with Two-Tone Stainless Steel Bracelet Watch-NS1733KM03"),
        ("OLEVS Watch", 5899, "OLEVS Watch for Men Diamond Business Dress Analog Quartz Stainless Steel Waterproof Luminous Date Two Tone Luxury Casual Wrist Watch"),
        ("ROLEX Watch", 5899, "ROLEX Watch for Men Diamond Business Dress Analog Quartz Stainless Steel Waterproof Luminous Date Two Tone Luxury Casual Wrist Watch"),
        ("Team Spirit", 799, "Team Spirit Pants"),
        ("Scott & James", 699, "Scott & James Men's Casual pants"),
        ("Urban Edge Slim Fit Chinos", 999, "Urban Edge Men's Stretchable Slim Fit Chinos"),
        ("XYXX Super Combed Cotton", 499, "XYXX Men's Checkmate Super Combed Cotton Casual Style pants"),
        ("BULLMER Regular Fit", 499, "BULLMER Men's Regular Fit Polyester Track Pant"),
        ("REDX Men Shorts", 574, "REDX Men Shorts || Men Shorts Cotton || Men Shorts Casual || Men Cotton Chino Shorts"),
        ("Elite Premium Cotton", 499, "Elite Men’s Premium Cotton Casual Shorts"),
        ("Luxurious Linen Casual", 749, "Luxurious Men’s Linen Casual Shorts"),
        ("Chromozome Cotton Rich", 499, "Chromozome Mens Cotton Rich Shorts"),
        ("Van Heusen Short", 399, "Van Heusen Men's Short"),
        ("BULLMER Cotton Chinese", 499, "BULLMER Mens Cotton Chinese Collar Tshirt"),
        ("Allen Solly Men's T shirts", 499, "Allen Solly Men's T shirts"),
        ("Levi's Men's T shirts", 1299, "Levi's Men's Slim Fit T shirts"),
        ("Adidas T shirt", 1499, "Adidas Men's T shirt"),
        ("Team Spirit", 1499, "Team Spirit T shirts")
        

    CREATE TABLE payment (
        payment_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        payment_method ENUM('UPI', 'Card', 'Cash on Delivery') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );

    Create table supplier(
        S_id int primary key auto_increment,
        S_name 	varchar(50)
    );

    Insert into supplier (s_name)
    values ('yaswant'),
        ('sai'),
        ('varun'),
        ('harsha'),
        ('sarath');

    create table orders (
        o_id int PRIMARY KEY,
        payment_id int not null,
        customer_id INT NOT NULL,
        o_date date,
        o_items int NOT null,
        o_total_amt int,
        o_status enum ('In progress','Ready to Dispatched','Dispatched','Delivered'),
        foreign key (payment_id) references payment(payment_id),
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
        );

    CREATE TABLE cart (
        cart_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(p_id),
    );





