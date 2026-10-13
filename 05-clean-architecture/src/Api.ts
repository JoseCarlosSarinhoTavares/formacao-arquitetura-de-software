// Driven Adapter

import express, { type Request, type Response } from "express";
import cors from "cors";
import type IAccountService from "./AccountService.ts";

export default class Api {
    constructor(readonly accountService: IAccountService) { 
        const app = express();
        app.use(express.json());
        app.use(cors());

        app.post("/signup", async (req: Request, res: Response) => {
            const input = req.body;
            try {
                const output = await accountService.Signup(input);
                res.json({
                    accountId: output.accountId
                });
            } catch (e: any) {
                res.json({
                    error: e.message
                });
            }
        });

        app.get("/accounts/:accountId", async (req: Request, res: Response) => {
            const accountId = req.params.accountId as string;
            const output = await accountService.GetAccount(accountId);
            res.json(output);
        });

        app.listen(3000);
    }
}