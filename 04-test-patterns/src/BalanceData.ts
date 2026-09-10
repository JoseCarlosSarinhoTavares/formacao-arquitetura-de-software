import pgp from "pg-promise";

export default class BalanceData {
    async upsert (balance: Balance): Promise<void> {
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

type Balance = {
    accountId: string;
    assetId: string;
    quantity: number;
};