// Driven Adapter

import pgp from "pg-promise";

export default interface IAccountDAO {
    Save (account: Account): Promise<void>;
    GetById (accountId: string): Promise<Account>;
    List (): Promise<Account[]>;
}

export default class AccountDAO implements IAccountDAO {
    async Save(account: Account): Promise<void> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        await connection.query("insert into app.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)", 
            [account.accountId, account.name, account.email, account.document, account.password]);
        await connection.$pool.end();
    }

    async GetById(accountId: string): Promise<Account> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        const [accountData] = await connection.query("select * from app.account where account_id = $1", [accountId]);
        const account = {
            accountId: accountData.account_id,
            name: accountData.name,
            email: accountData.email,
            document: accountData.document,
            password: accountData.password
        }
        await connection.$pool.end();
        return account;
    };

    async List (): Promise<Account[]> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        const accountsData = await connection.query("select * from app.account", []);
        const accounts: Account[] = [];
        for (const accountData of accountsData) {
            const account = {
                accountId: accountData.account_id,
                name: accountData.name,
                email: accountData.email,
                document: accountData.document,
                password: accountData.password
            }
            accounts.push(account);
        }
        
        await connection.$pool.end();
        return accounts;
    }
}

export class AccountDAOFake implements IAccountDAO {
    accounts: Account[] = [];
    async Save(account: Account): Promise<void>{
        this.accounts.push(account);
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

type Account = {
    accountId: string;
    name: string;
    email: string;
    document: string;
    password: string;
}