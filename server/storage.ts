import { 
  customers, 
  goldCalculations, 
  invoices,
  type Customer, 
  type InsertCustomer,
  type GoldCalculation,
  type InsertGoldCalculation,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, count } from "drizzle-orm";

export interface IStorage {
  // Customer methods
  getCustomers(search?: string, limit?: number, offset?: number): Promise<{ customers: Customer[], total: number }>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByCustomerId(customerId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Gold calculation methods
  getCalculations(customerId?: string, limit?: number): Promise<GoldCalculation[]>;
  createCalculation(calculation: InsertGoldCalculation): Promise<GoldCalculation>;
  
  // Invoice methods
  getInvoices(search?: string, customerId?: string, status?: string, limit?: number, offset?: number): Promise<{ invoices: (Invoice & { customer: Customer })[], total: number }>;
  getInvoice(id: string): Promise<(Invoice & { customer: Customer }) | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalCustomers: number;
    todayInvoices: number;
    totalRevenue: string;
    goldProcessed: string;
  }>;
  
  // Initialize sample data
  initializeSampleData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCustomers(search?: string, limit = 50, offset = 0): Promise<{ customers: Customer[], total: number }> {
    const baseQuery = db.select().from(customers);
    const baseCountQuery = db.select({ count: count() }).from(customers);
    
    if (search) {
      const searchCondition = like(customers.name, `%${search}%`);
      const searchResults = await baseQuery.where(searchCondition).limit(limit).offset(offset).orderBy(customers.name);
      const searchCount = await baseCountQuery.where(searchCondition);
      return {
        customers: searchResults,
        total: searchCount[0]?.count || 0
      };
    }
    
    const customerResults = await baseQuery.limit(limit).offset(offset).orderBy(customers.name);
    const totalResults = await baseCountQuery;
    
    return {
      customers: customerResults,
      total: totalResults[0]?.count || 0
    };
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByCustomerId(customerId: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.customerId, customerId));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async getCalculations(customerId?: string, limit = 10): Promise<GoldCalculation[]> {
    const baseQuery = db.select().from(goldCalculations);
    
    if (customerId) {
      return await baseQuery.where(eq(goldCalculations.customerId, customerId)).limit(limit).orderBy(desc(goldCalculations.createdAt));
    }
    
    return await baseQuery.limit(limit).orderBy(desc(goldCalculations.createdAt));
  }

  async createCalculation(insertCalculation: InsertGoldCalculation): Promise<GoldCalculation> {
    const weight = parseFloat(insertCalculation.weight.toString());
    const purity = parseFloat(insertCalculation.purity.toString());
    const goldRate = parseFloat(insertCalculation.goldRate.toString());
    
    const pureGoldWeight = (weight * purity) / 100;
    const totalValue = pureGoldWeight * goldRate;
    
    const [calculation] = await db
      .insert(goldCalculations)
      .values({
        ...insertCalculation,
        pureGoldWeight: pureGoldWeight.toFixed(3),
        totalValue: totalValue.toFixed(2),
      })
      .returning();
    return calculation;
  }

  async getInvoices(search?: string, customerId?: string, status?: string, limit = 50, offset = 0): Promise<{ invoices: (Invoice & { customer: Customer })[], total: number }> {
    let conditions = [];
    
    if (search) {
      conditions.push(like(invoices.invoiceNumber, `%${search}%`));
    }
    if (customerId) {
      conditions.push(eq(invoices.customerId, customerId));
    }
    if (status) {
      conditions.push(eq(invoices.status, status));
    }
    
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [invoiceResults, totalResults] = await Promise.all([
      db.select()
        .from(invoices)
        .leftJoin(customers, eq(invoices.customerId, customers.id))
        .where(whereCondition)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(invoices.createdAt)),
      db.select({ count: count() })
        .from(invoices)
        .where(whereCondition)
    ]);
    
    return {
      invoices: invoiceResults.map(row => ({
        ...row.invoices,
        customer: row.customers!
      })),
      total: totalResults[0]?.count || 0
    };
  }

  async getInvoice(id: string): Promise<(Invoice & { customer: Customer }) | undefined> {
    const [result] = await db.select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.invoices,
      customer: result.customers!
    };
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    // Generate invoice number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const customer = await this.getCustomer(insertInvoice.customerId);
    const invoiceNumber = `INV-${customer?.customerId}-${dateStr}-${Date.now().toString().slice(-4)}`;
    
    const [invoice] = await db
      .insert(invoices)
      .values({
        ...insertInvoice,
        invoiceNumber,
      })
      .returning();
    return invoice;
  }

  async getDashboardStats(): Promise<{
    totalCustomers: number;
    todayInvoices: number;
    totalRevenue: string;
    goldProcessed: string;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [customerCount, todayInvoicesResult, revenueResult, goldResult] = await Promise.all([
      db.select({ count: count() }).from(customers),
      db.select({ count: count() }).from(invoices).where(eq(invoices.status, 'paid')),
      db.select({ total: invoices.total }).from(invoices).where(eq(invoices.status, 'paid')),
      db.select({ weight: goldCalculations.weight }).from(goldCalculations)
    ]);
    
    const totalRevenue = revenueResult.reduce((sum, inv) => sum + parseFloat(inv.total.toString()), 0);
    const goldProcessed = goldResult.reduce((sum, calc) => sum + parseFloat(calc.weight.toString()), 0);
    
    return {
      totalCustomers: customerCount[0]?.count || 0,
      todayInvoices: todayInvoicesResult[0]?.count || 0,
      totalRevenue: totalRevenue.toFixed(2),
      goldProcessed: goldProcessed.toFixed(1)
    };
  }

  async initializeSampleData(): Promise<void> {
    // Check if customers already exist
    const existingCustomers = await db.select({ count: count() }).from(customers);
    if (existingCustomers[0]?.count > 0) return;

    const sampleCustomers = [
      { customerId: "CU001", name: "Rajesh Kumar", phone: "+91 98765 43210", email: "rajesh@email.com", address: "123 Business Street", city: "Mumbai", state: "Maharashtra" },
      { customerId: "CU002", name: "Priya Sharma", phone: "+91 87654 32109", email: "priya@email.com", address: "456 Market Road", city: "Delhi", state: "NCR" },
      { customerId: "CU003", name: "Amit Patel", phone: "+91 76543 21098", email: "amit@email.com", address: "789 Commerce Lane", city: "Ahmedabad", state: "Gujarat" },
      { customerId: "CU004", name: "Sunita Gupta", phone: "+91 65432 10987", email: "sunita@email.com", address: "321 Trade Circle", city: "Jaipur", state: "Rajasthan" },
      { customerId: "CU005", name: "Vikash Tiwari", phone: "+91 54321 09876", email: "vikash@email.com", address: "654 Gold Street", city: "Lucknow", state: "UP" },
      { customerId: "CU006", name: "Meera Reddy", phone: "+91 43210 98765", email: "meera@email.com", address: "987 Silver Plaza", city: "Hyderabad", state: "Telangana" },
      { customerId: "CU007", name: "Rohit Singh", phone: "+91 32109 87654", email: "rohit@email.com", address: "147 Jewel Lane", city: "Pune", state: "Maharashtra" },
      { customerId: "CU008", name: "Kavya Nair", phone: "+91 21098 76543", email: "kavya@email.com", address: "258 Diamond Road", city: "Kochi", state: "Kerala" },
      { customerId: "CU009", name: "Arjun Mehta", phone: "+91 10987 65432", email: "arjun@email.com", address: "369 Precious Avenue", city: "Bangalore", state: "Karnataka" },
      { customerId: "CU010", name: "Deepika Joshi", phone: "+91 09876 54321", email: "deepika@email.com", address: "741 Golden Square", city: "Indore", state: "Madhya Pradesh" },
      { customerId: "CU011", name: "Ravi Verma", phone: "+91 98765 43211", email: "ravi@email.com", address: "852 Platinum Park", city: "Surat", state: "Gujarat" },
      { customerId: "CU012", name: "Anita Rao", phone: "+91 87654 32110", email: "anita@email.com", address: "963 Crown Colony", city: "Chennai", state: "Tamil Nadu" },
      { customerId: "CU013", name: "Manoj Kumar", phone: "+91 76543 21099", email: "manoj@email.com", address: "159 Royal Street", city: "Kanpur", state: "UP" },
      { customerId: "CU014", name: "Pooja Agarwal", phone: "+91 65432 10988", email: "pooja@email.com", address: "357 Elite Plaza", city: "Nagpur", state: "Maharashtra" },
      { customerId: "CU015", name: "Kiran Yadav", phone: "+91 54321 09877", email: "kiran@email.com", address: "486 Noble Heights", city: "Bhopal", state: "Madhya Pradesh" },
      { customerId: "CU016", name: "Sneha Desai", phone: "+91 43210 98766", email: "sneha@email.com", address: "579 Grand Avenue", city: "Vadodara", state: "Gujarat" },
      { customerId: "CU017", name: "Ashok Chauhan", phone: "+91 32109 87655", email: "ashok@email.com", address: "680 Regal Road", city: "Gwalior", state: "Madhya Pradesh" },
      { customerId: "CU018", name: "Nisha Bansal", phone: "+91 21098 76544", email: "nisha@email.com", address: "791 Imperial Lane", city: "Meerut", state: "UP" },
      { customerId: "CU019", name: "Suresh Malhotra", phone: "+91 10987 65433", email: "suresh@email.com", address: "813 Majestic Mall", city: "Faridabad", state: "Haryana" },
      { customerId: "CU020", name: "Rekha Sinha", phone: "+91 09876 54322", email: "rekha@email.com", address: "924 Supreme Circle", city: "Patna", state: "Bihar" },
      { customerId: "CU021", name: "Vinod Sharma", phone: "+91 98765 43212", email: "vinod@email.com", address: "135 Victory Plaza", city: "Ludhiana", state: "Punjab" },
      { customerId: "CU022", name: "Geeta Pandey", phone: "+91 87654 32111", email: "geeta@email.com", address: "246 Triumph Tower", city: "Agra", state: "UP" },
      { customerId: "CU023", name: "Dinesh Gupta", phone: "+91 76543 21000", email: "dinesh@email.com", address: "357 Fortune Heights", city: "Jaipur", state: "Rajasthan" },
      { customerId: "CU024", name: "Sonal Jain", phone: "+91 65432 10999", email: "sonal@email.com", address: "468 Prosperity Park", city: "Ajmer", state: "Rajasthan" },
      { customerId: "CU025", name: "Raj Thakur", phone: "+91 54321 09888", email: "raj@email.com", address: "579 Success Square", city: "Shimla", state: "Himachal Pradesh" },
      { customerId: "CU026", name: "Preeti Saxena", phone: "+91 43210 98777", email: "preeti@email.com", address: "680 Excellence Estate", city: "Dehradun", state: "Uttarakhand" },
      { customerId: "CU027", name: "Ajay Tripathi", phone: "+91 32109 87666", email: "ajay@email.com", address: "791 Achievement Avenue", city: "Allahabad", state: "UP" },
      { customerId: "CU028", name: "Swati Mishra", phone: "+91 21098 76555", email: "swati@email.com", address: "802 Milestone Manor", city: "Varanasi", state: "UP" },
      { customerId: "CU029", name: "Harish Goel", phone: "+91 10987 65444", email: "harish@email.com", address: "913 Summit Street", city: "Chandigarh", state: "Punjab" },
      { customerId: "CU030", name: "Nidhi Kapoor", phone: "+91 09876 54333", email: "nidhi@email.com", address: "024 Pinnacle Plaza", city: "Amritsar", state: "Punjab" },
      { customerId: "CU031", name: "Sandeep Arora", phone: "+91 98765 43213", email: "sandeep@email.com", address: "135 Zenith Zone", city: "Jalandhar", state: "Punjab" },
      { customerId: "CU032", name: "Anju Bhatt", phone: "+91 87654 32112", email: "anju@email.com", address: "246 Apex Apartments", city: "Haridwar", state: "Uttarakhand" },
      { customerId: "CU033", name: "Naveen Kumar", phone: "+91 76543 21001", email: "naveen@email.com", address: "357 Crown Complex", city: "Rishikesh", state: "Uttarakhand" },
      { customerId: "CU034", name: "Shweta Garg", phone: "+91 65432 10000", email: "shweta@email.com", address: "468 Royal Residency", city: "Mathura", state: "UP" },
      { customerId: "CU035", name: "Yogesh Pandey", phone: "+91 54321 09999", email: "yogesh@email.com", address: "579 Elite Enclave", city: "Vrindavan", state: "UP" },
      { customerId: "CU036", name: "Rashmi Sood", phone: "+91 43210 98888", email: "rashmi@email.com", address: "680 Grand Gateway", city: "Panipat", state: "Haryana" },
      { customerId: "CU037", name: "Deepak Sethi", phone: "+91 32109 87777", email: "deepak@email.com", address: "791 Supreme Suites", city: "Karnal", state: "Haryana" },
      { customerId: "CU038", name: "Kavita Malhotra", phone: "+91 21098 76666", email: "kavita@email.com", address: "802 Luxury Lodge", city: "Ambala", state: "Haryana" },
      { customerId: "CU039", name: "Vivek Sharma", phone: "+91 10987 65555", email: "vivek@email.com", address: "913 Premium Plaza", city: "Kurukshetra", state: "Haryana" },
      { customerId: "CU040", name: "Divya Singh", phone: "+91 09876 54444", email: "divya@email.com", address: "024 Sterling Square", city: "Rohtak", state: "Haryana" },
      { customerId: "CU041", name: "Anil Gupta", phone: "+91 98765 43214", email: "anil@email.com", address: "135 Golden Gateway", city: "Hisar", state: "Haryana" },
      { customerId: "CU042", name: "Sunita Verma", phone: "+91 87654 32113", email: "sunita.v@email.com", address: "246 Diamond District", city: "Sirsa", state: "Haryana" },
      { customerId: "CU043", name: "Mukesh Jain", phone: "+91 76543 21002", email: "mukesh@email.com", address: "357 Precious Plaza", city: "Bhiwani", state: "Haryana" },
      { customerId: "CU044", name: "Archana Mittal", phone: "+91 65432 10001", email: "archana@email.com", address: "468 Jewel Junction", city: "Rewari", state: "Haryana" },
      { customerId: "CU045", name: "Sanjay Ahluwalia", phone: "+91 54321 09000", email: "sanjay@email.com", address: "579 Treasure Towers", city: "Sonipat", state: "Haryana" },
      { customerId: "CU046", name: "Madhuri Chopra", phone: "+91 43210 98000", email: "madhuri@email.com", address: "680 Platinum Place", city: "Palwal", state: "Haryana" },
      { customerId: "CU047", name: "Rakesh Bhatia", phone: "+91 32109 87000", email: "rakesh@email.com", address: "791 Silver Street", city: "Gurgaon", state: "Haryana" },
      { customerId: "CU048", name: "Priyanka Khanna", phone: "+91 21098 76000", email: "priyanka@email.com", address: "802 Gold Grove", city: "Faridabad", state: "Haryana" },
      { customerId: "CU049", name: "Vikas Goyal", phone: "+91 10987 65000", email: "vikas@email.com", address: "913 Crystal Court", city: "Bahadurgarh", state: "Haryana" },
      { customerId: "CU050", name: "Sapna Aggarwal", phone: "+91 09876 54000", email: "sapna@email.com", address: "024 Emerald Estate", city: "Jhajjar", state: "Haryana" }
    ];

    for (const customer of sampleCustomers) {
      await db.insert(customers).values(customer);
    }
  }
}

export const storage = new DatabaseStorage();
