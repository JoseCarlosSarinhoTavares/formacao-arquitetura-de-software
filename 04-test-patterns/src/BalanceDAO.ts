import pgp from "pg-promise";

export default interface IBalanceDAO {
    Upsert(balance: Balance): Promise<void>;
    ListByAccountId(accountId: string): Promise<Balance[]>;
}
export class BalanceDAO implements IBalanceDAO {
    async Upsert (balance: Balance): Promise<void> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        await connection.query("insert into app.balance (account_id, asset_id, quantity) values ($1, $2, $3) on conflict (account_id, asset_id) do update set quantity = excluded.quantity", 
        [balance.accountId, balance.assetId, balance.quantity]);
        await connection.$pool.end();
    }

    async ListByAccountId(accountId: string): Promise<Balance[]> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        const balancesData = await connection.query("select account_id, asset_id, quantity from app.balance where account_id = $1", [accountId]);
        const balances: Balance[] = [];
        for (const balanceData of balancesData) {
            balances.push({
                accountId: balanceData.account_id,
                assetId: balanceData.asset_id,
                quantity: parseFloat(balanceData.quantity)
            });
        }
        await connection.$pool.end();
        return balances;
    }
}

export class BalanceDAOFake implements IBalanceDAO {
    balances: Balance[] = [];
    async Upsert(balance: Balance): Promise<void> {
        const existingBalance = this.balances.find((b: Balance) => b.accountId === balance.accountId && b.assetId === balance.assetId);
        if (existingBalance) {
            existingBalance.quantity = balance.quantity;
        } else {
            this.balances.push(balance);
        }
    }

    async ListByAccountId(accountId: string): Promise<Balance[]> {
        return this.balances.filter((b: Balance) => b.accountId === accountId);
    }
}

type Balance = {
    accountId: string;
    assetId: string;
    quantity: number;
};