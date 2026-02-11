import { User, AuditLog, VerificationSession, ServiceResponse, AuthUser, Role, Technician } from '../types';

// Initial Seed Data
const INITIAL_USERS: User[] = [
  {
    id: 1,
    contract: 'CTR-2024-001',
    nom: 'Alice Dupont',
    cin: 'AB123456',
    phone: '0611223344',
    phone2: null,
    phoneVerified: true,
    phoneUpdateCount: 0,
    lastVerifiedAt: new Date('2024-01-15T10:00:00Z').toISOString(),
    lastModifiedBy: 'admin',
    lastModifiedAt: new Date('2024-01-15T10:00:00Z').toISOString(),
    createdAt: new Date('2024-01-01T09:00:00Z').toISOString(),
  },
  {
    id: 2,
    contract: 'CTR-2024-002',
    nom: 'Bob Martin',
    cin: 'XY987654',
    phone: null,
    phone2: '0799887766',
    phoneVerified: false,
    phoneUpdateCount: 0,
    lastVerifiedAt: null,
    lastModifiedBy: 'admin',
    lastModifiedAt: new Date('2024-02-01T09:00:00Z').toISOString(),
    createdAt: new Date('2024-02-01T09:00:00Z').toISOString(),
  }
];

const INITIAL_TECHS: Technician[] = [
    { id: 1, username: 'tech', password: 'tech123', name: 'Technician 01' }
];

const STORAGE_KEYS = {
  USERS: 'gc_users',
  LOGS: 'gc_logs',
  VERIFICATIONS: 'gc_verifications', // Map<userId, VerificationSession>
  TECHNICIANS: 'gc_technicians',
  ADMIN_PASS: 'gc_admin_pass'
};

class MockDatabaseService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VERIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TECHNICIANS)) {
        localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(INITIAL_TECHS));
    }
    // Admin password defaults to 'admin123' if not set
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PASS)) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, 'admin123');
    }
  }

  private getUsers(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  private saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private getTechnicians(): Technician[] {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TECHNICIANS) || '[]');
  }

  private saveTechnicians(techs: Technician[]) {
      localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(techs));
  }

  private getLogs(): AuditLog[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
  }

  private addLog(action: string, details: string, actor: string) {
    const logs = this.getLogs();
    const newLog: AuditLog = {
      id: Date.now(),
      action,
      details,
      actor,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog); // Newest first
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  private getVerifications(): Record<number, VerificationSession> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.VERIFICATIONS) || '{}');
  }

  private saveVerifications(verifs: Record<number, VerificationSession>) {
    localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(verifs));
  }

  // --- Public API Simulation ---

  // 0. Auth
  public async login(username: string, password: string): Promise<ServiceResponse<AuthUser>> {
    await new Promise(r => setTimeout(r, 600)); // Simulate delay
    
    // Check Admin
    if (username === 'admin') {
        const storedPass = localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || 'admin123';
        if (password === storedPass) {
            return { success: true, data: { username: 'admin', role: Role.ADMIN, name: 'System Admin' } };
        }
    }

    // Check Technicians
    const techs = this.getTechnicians();
    const tech = techs.find(t => t.username === username && t.password === password);
    
    if (tech) {
        return { success: true, data: { username: tech.username, role: Role.TECHNICIAN, name: tech.name } };
    }
    
    return { success: false, message: 'Invalid credentials' };
  }

  public async changePassword(username: string, newPass: string): Promise<ServiceResponse<void>> {
      await new Promise(r => setTimeout(r, 400));
      
      if (username === 'admin') {
          localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, newPass);
          return { success: true };
      }
      
      // Update Technician
      const techs = this.getTechnicians();
      const idx = techs.findIndex(t => t.username === username);
      if (idx !== -1) {
          techs[idx].password = newPass;
          this.saveTechnicians(techs);
          return { success: true };
      }

      return { success: false, message: 'User not found' };
  }

  // 1. Get User by Contract
  public async getUserByContract(contract: string): Promise<ServiceResponse<User>> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 400));
    const users = this.getUsers();
    const user = users.find(u => u.contract.trim().toLowerCase() === contract.trim().toLowerCase());
    
    if (user) {
      return { success: true, data: user };
    }
    return { success: false, message: 'Contract not found.' };
  }

  // 2. Get All Users (Admin)
  public async getAllUsers(): Promise<ServiceResponse<User[]>> {
    await new Promise(r => setTimeout(r, 400));
    return { success: true, data: this.getUsers() };
  }

  // 3. Generate and "Send" Verification Code
  // --------------------------------------------------------------------------------
  // FUNCTION: sendVerificationCode
  // Integrates with SendSMSGate for OTP delivery.
  // --------------------------------------------------------------------------------
  public async sendVerificationCode(contract: string, newPhone: string, actor: string): Promise<ServiceResponse<string>> {
    await new Promise(r => setTimeout(r, 600));
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.contract === contract);
    
    if (userIndex === -1) return { success: false, message: 'User not found' };

    // Basic phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newPhone.replace(/\s/g, ''))) {
        return { success: false, message: 'Invalid phone format. Use 10 digits.' };
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save verification session
    const verifs = this.getVerifications();
    verifs[users[userIndex].id] = {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
      used: false,
      purpose: 'phone_update'
    };
    this.saveVerifications(verifs);
    
    this.addLog('VERIFICATION_SENT', `SMS Code sent to ${newPhone} for contract ${contract}`, actor);

    // =========================================================================
    // [INTEGRATION START] SendSMSGate OTP API
    // =========================================================================
    // To enable real SMS sending, uncomment the block below and configure your API Key.
    // Ensure this request is made securely (ideally via a backend proxy to hide the Key).
    
    /*
    try {
        const API_ENDPOINT = "https://api.sendsmsgate.com/send-otp"; // Replace with actual URL
        const API_KEY = "YOUR_SENDSMSGATE_API_KEY";
        const SENDER_ID = "G_CONTRATS";

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                recipient: newPhone,
                code: code, // Some gateways accept the code directly
                message: `Your verification code is ${code}`, // Others require full text
                sender: SENDER_ID
            })
        });

        if (!response.ok) {
            console.error("SendSMSGate Error:", await response.text());
        }
    } catch (err) {
        console.error("Network Error connecting to SMS Gateway:", err);
    }
    */
    // =========================================================================
    // [INTEGRATION END]
    // =========================================================================

    // SIMULATION: Log to console so you can test without paying for SMS
    const logEntry = `[${new Date().toISOString()}] SENDSMSGATE_OTP | Contract: ${contract} | Phone: ${newPhone} | Code: ${code} | Status: SENT (Simulated)`;
    console.log(`%c[MockDb] SMS Sent via SendSMSGate:\n${logEntry}`, 'color: #22c55e; font-weight: bold; padding: 4px; border: 1px solid #22c55e; border-radius: 4px;');

    return { success: true, message: 'Code sent via SMS!', data: code };
  }

  // 4. Verify Code
  public async verifyCode(contract: string, inputCode: string, newPhone: string, actor: string): Promise<ServiceResponse<User>> {
    await new Promise(r => setTimeout(r, 500));
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.contract === contract);
    if (userIndex === -1) return { success: false, message: 'User not found' };

    const user = users[userIndex];
    const verifs = this.getVerifications();
    const session = verifs[user.id];

    if (!session) return { success: false, message: 'No verification pending.' };
    if (session.used) return { success: false, message: 'Code already used.' };
    if (Date.now() > session.expiresAt) return { success: false, message: 'Code expired.' };
    if (session.code !== inputCode) return { success: false, message: 'Invalid code.' };

    // Success! Update User
    session.used = true;
    this.saveVerifications(verifs);

    // Logic: If client is verifying, increment phoneUpdateCount
    const isClientAction = actor === 'client';
    const newCount = isClientAction ? (user.phoneUpdateCount || 0) + 1 : (user.phoneUpdateCount || 0);

    const updatedUser: User = {
      ...user,
      phone: newPhone,
      phoneVerified: true,
      phoneUpdateCount: newCount,
      lastVerifiedAt: new Date().toISOString(),
      lastModifiedBy: actor,
      lastModifiedAt: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;
    this.saveUsers(users);
    this.addLog('PHONE_VERIFIED', `Phone verified for ${contract} to ${newPhone} (Updates: ${newCount})`, actor);

    return { success: true, data: updatedUser };
  }

  // 5. Technician/Admin Direct Update (Full Record)
  public async updateUser(user: User, actor: string): Promise<ServiceResponse<User>> {
    await new Promise(r => setTimeout(r, 400));
    
    const users = this.getUsers();
    // Check if contract exists (and not this user)
    const duplicate = users.find(u => u.contract === user.contract && u.id !== user.id);
    if (duplicate) return { success: false, message: 'Contract ID must be unique.' };

    const index = users.findIndex(u => u.id === user.id);
    let newUser: User;

    if (index === -1) {
      // Create new
      newUser = {
        ...user,
        id: Date.now(),
        phoneUpdateCount: 0,
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: actor
      };
      users.push(newUser);
      this.addLog('USER_CREATED', `Created user ${newUser.contract}`, actor);
    } else {
      // Update
      newUser = {
        ...users[index],
        ...user,
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: actor
      };
      users[index] = newUser;
      this.addLog('USER_UPDATED', `Updated details for ${user.contract}`, actor);
    }

    this.saveUsers(users);
    return { success: true, data: newUser };
  }

  // 6. Delete User
  public async deleteUser(id: number, actor: string): Promise<ServiceResponse<void>> {
      await new Promise(r => setTimeout(r, 300));
      let users = this.getUsers();
      const user = users.find(u => u.id === id);
      if (!user) return { success: false, message: 'User not found' };

      users = users.filter(u => u.id !== id);
      this.saveUsers(users);
      this.addLog('USER_DELETED', `Deleted user ${user.contract}`, actor);
      return { success: true };
  }

  // 7. Get Audit Logs
  public async getAuditLogs(): Promise<ServiceResponse<AuditLog[]>> {
    await new Promise(r => setTimeout(r, 200));
    return { success: true, data: this.getLogs() };
  }

  // 8. Staff (Technician) CRUD
  public async getStaff(): Promise<ServiceResponse<Technician[]>> {
      return { success: true, data: this.getTechnicians() };
  }

  public async saveStaff(tech: Technician, actor: string): Promise<ServiceResponse<Technician>> {
      const techs = this.getTechnicians();
      
      // Check username uniqueness
      const existing = techs.find(t => t.username === tech.username && t.id !== tech.id);
      if (existing) return { success: false, message: 'Username already taken.' };

      if (tech.id) {
          // Update
          const index = techs.findIndex(t => t.id === tech.id);
          if (index !== -1) {
              techs[index] = tech;
              this.saveTechnicians(techs);
              this.addLog('STAFF_UPDATED', `Updated technician ${tech.username}`, actor);
              return { success: true, data: tech };
          }
      } else {
          // Create
          const newTech = { ...tech, id: Date.now() };
          techs.push(newTech);
          this.saveTechnicians(techs);
          this.addLog('STAFF_CREATED', `Created technician ${newTech.username}`, actor);
          return { success: true, data: newTech };
      }
      return { success: false, message: 'Error saving staff member.' };
  }

  public async deleteStaff(id: number, actor: string): Promise<ServiceResponse<void>> {
      let techs = this.getTechnicians();
      const tech = techs.find(t => t.id === id);
      if (tech) {
          techs = techs.filter(t => t.id !== id);
          this.saveTechnicians(techs);
          this.addLog('STAFF_DELETED', `Deleted technician ${tech.username}`, actor);
      }
      return { success: true };
  }

  // 9. Import Users (CSV)
  public async importUsers(usersToImport: Partial<User>[], actor: string): Promise<ServiceResponse<{imported: number, failed: number, errors: string[]}>> {
      await new Promise(r => setTimeout(r, 500));
      const currentUsers = this.getUsers();
      let importedCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const u of usersToImport) {
          // Validation
          if (!u.contract || !u.nom) {
              failedCount++;
              errors.push(`Row missing contract or name.`);
              continue;
          }

          // Check duplicate contract
          if (currentUsers.some(existing => existing.contract.toLowerCase() === u.contract?.toLowerCase())) {
              failedCount++;
              errors.push(`Contract ${u.contract} already exists.`);
              continue;
          }

          const newUser: User = {
            id: Date.now() + Math.random(), // Simple ID gen
            contract: u.contract,
            nom: u.nom,
            cin: u.cin || '',
            phone: u.phone || null,
            phone2: u.phone2 || null, // Import Phone 2
            phoneVerified: false,
            phoneUpdateCount: 0,
            lastVerifiedAt: null,
            lastModifiedBy: actor,
            lastModifiedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };

          currentUsers.push(newUser);
          importedCount++;
      }

      if (importedCount > 0) {
          this.saveUsers(currentUsers);
          this.addLog('BATCH_IMPORT', `Imported ${importedCount} users via CSV`, actor);
      }

      return { success: true, data: { imported: importedCount, failed: failedCount, errors } };
  }
}

export const dbService = new MockDatabaseService();