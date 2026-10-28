import type IAccountRepository from "./AccountRepository.ts";
import type PaymentGateway from "./PaymentGateway.ts";
import type IUserCase from "./IUserCase.ts";

export class Deposit implements IUserCase {
    constructor(
        readonly accountRepository: IAccountRepository,
        readonly paymentGateway: PaymentGateway
    ) { }

    async Execute(input: Input): Promise<void> {
        const account = await this.accountRepository.GetById(input.accountId);
        const inputProcessTransaction = {
            creditCardHolder: input.creditCardHolder,
            creditCardNumber: input.creditCardNumber,
            creditCardExpDate: input.creditCardExpiration,
            creditCardCvv: input.creditCardCvv,
            amount: input.quantity
        };
        const outputProcessTransaction = await this.paymentGateway.ProcessTransaction(inputProcessTransaction);
        if (outputProcessTransaction.autorizada === "1") {
            account.Deposit(input.assetId, input.quantity);
            await this.accountRepository.Update(account);
        }
    }
}

type Input = {
    accountId: string;
    assetId: string;
    quantity: number;
    creditCardHolder: string;
    creditCardNumber: string;
    creditCardExpiration: string;
    creditCardCvv: string;
}