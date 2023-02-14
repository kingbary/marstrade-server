import { Types } from "mongoose"

/**
 * TYPES
 */
export type ID = Types.ObjectId | string
export type WALLET = 'btc' | 'eth' | 'usdt'
export type invPackageType = 'AGRICULTURE' | 'FOREX' | 'REAL_ESTATE' | 'INHERITANCE' | 'ENERGY' | 'CRYPTOCURRENCY' | 'METAL'
export type BASIC = 'AGRICULTURE' | 'FOREX'
export type PREMIUM = 'REAL_ESTATE' | 'INHERITANCE'
export type VIP = 'ENERGY' | 'CRYPTOCURRENCY' | 'METAL'

export type TransDetails = {
    investor: ID;
    method: string;
    amount: number;
    walletAddress: string;
    receipt: string;
}


/**
 * ENUMS
 */
export enum PLANS {
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
    VIP = 'VIP'
}

export enum STATUS {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
}


/**
 * INTERFACES
 */
export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    verified: boolean;
    role: string;
    id?: string;
    country?: string;
    DOB?: string;
    IDType?: string;
    IDFront?: string;
    IDBack?: string;
}

export interface IWallet {
    type: string;
    address: string;
    barcode: string;
}

export interface IWalletGroup {
    btc: IWallet;
    eth: IWallet;
    usdt: IWallet;
}

export interface IDashboard {
    owner: ID;
    referralLink: string;
    referrals: number;
    referralBonus: number;
    hasInvestment: boolean;
    avatar?: string;
    investment?: ID | IInvestment;
    withdrawable_fund: number;
    issues: string[];
    // investment?: {
    //     investmentPlan: string;
    //     investmentPackage: string;
    //     investmentAmount: number;
    //     ROI: number;
    // };
    btc: ID;
    eth: ID;
    usdt: ID;
}

export interface IMailData {
    email: string,
    firstName: string,
    amount: string,
    method: string,
    invPlan: string,
    invPackage: string,
    ROI: string,
}

export interface ITransactionReq {
    investor: ID;
    method: string;
    receipt: string;
    investmentAmount: number;
}

export interface IInvestmentReq extends ITransactionReq {
    investmentPlan: PLANS;
    investmentPackage: string;
}

export interface IInvestment {
    id?: string;
    investor: ID | IUser;
    transaction: ID | ITransaction;
    investmentPlan: PLANS;
    investmentPackage: string;
    investmentAmount: number;
    status: STATUS;
    isActive: boolean;
    ROI: number;
    createdAt: Date;
}

export interface ITransaction {
    id?: string;
    investor: ID;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    walletAddress: string;
    receipt: string;
    method: string;
    completed: boolean;
}

export interface IDBResponse {
    statusCode: number;
    message: string;
}

export interface IKYCData {
    country: string;
    DOB: string;
    IDType: string;
    IDFront: string;
    IDBack: string;
}

export interface IServiceResponse {
    isSuccess: boolean,
    message: string,
    statusCode: number,
    imageURL?: string,
}
