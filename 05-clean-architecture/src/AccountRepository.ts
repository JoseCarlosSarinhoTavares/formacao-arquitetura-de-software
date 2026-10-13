import pgp from "pg-promise";
import Account, { type Balance } from "./Account.ts";

export default interface IAccountRepository {
    Save (account: Account): Promise<void>;
    Update (account: Account): Promise<void>;
    GetById (accountId: string): Promise<Account>;
    List (): Promise<Account[]>;
}

export default class AccountRepository implements IAccountRepository {
    async Save(account: Account): Promise<void> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        await connection.query("insert into app.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)", 
            [account.accountId, account.GetName(), account.email, account.document, account.password]);
        for (const balance of account.balances) {
            await connection.query("insert into app.balance (account_id, asset_id, quantity) values ($1, $2, $3) on conflict (account_id, asset_id) do update set quantity = excluded.quantity", 
            [account.accountId, balance.assetId, balance.quantity]);
        }                   
        await connection.$pool.end();
    }

    async Update(account: Account): Promise<void> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        await connection.query("update app.account set name = $1, email = $2, document = $3, password = $4 where account_id = $5", 
            [account.GetName(), account.email, account.document, account.password, account.accountId]);
        for (const balance of account.balances) {
            await connection.query("insert into app.balance (account_id, asset_id, quantity) values ($1, $2, $3) on conflict (account_id, asset_id) do update set quantity = excluded.quantity", 
            [account.accountId, balance.assetId, balance.quantity]);
        }      
        await connection.$pool.end();
    }

    async GetById(accountId: string): Promise<Account> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        const [accountData] = await connection.query("select * from app.account where account_id = $1", [accountId]);
        const balancesData = await connection.query("select * from app.balance where account_id = $1", [accountId]);
        const balances: Balance[] = [];
        for (const balanceData of balancesData) {
            balances.push({
                assetId: balanceData.asset_id,
                quantity: parseFloat(balanceData.quantity)
            })
        }
        const account = new Account(accountData.account_id, accountData.name, accountData.email,
        accountData.document, accountData.password, balances
        );
        await connection.$pool.end();
        return account;
    };

    async List (): Promise<Account[]> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        const accountsData = await connection.query("select * from app.account", []);
        const accounts: Account[] = [];
        for (const accountData of accountsData) {
            const account = new Account(accountData.account_id, accountData.name, accountData.email,
            accountData.document, accountData.password, []);
            accounts.push(account);
        }
        
        await connection.$pool.end();
        return accounts;
    }
}

export class AccountRepositoryFake implements IAccountRepository {
    accounts: Account[] = [];
    async Save(account: Account): Promise<void>{
        this.accounts.push(account);
    }

    async Update(account: unknown): Promise<void> {
        
    }

    async GetById(accountId: string): Promise<Account>{
        const account = this.accounts.find(account => account.accountId === accountId);
        if(!account) throw new Error("Account not found");
        return account;
    }

    async List(): Promise<Account[]> {
        return this.accounts;
    }
}