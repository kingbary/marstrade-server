import { Types } from "mongoose"

export type ID = Types.ObjectId | string
export type WALLET = 'btc' | 'eth' | 'usdt'

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
    hasInvestment: boolean;
    avatar?: string;
    investment?: {
        investmentPlan: string;
        investmentPackage: string;
        investmentAmount: number;
        ROI: number;
    };
    btc: ID
    eth: ID
    usdt: ID
}

export interface IInvestmentReq {
    investor: ID;
    investmentPlan: PLANS;
    investmentPackage: string;
    investmentAmount: number;
    receipt: string;
}

export interface IInvestment {
    id?: string;
    investor: ID;
    investmentPlan: PLANS;
    investmentPackage: string;
    investmentAmount: number;
    receipt: string;
    status: STATUS,
    isActive: boolean;
    ROI: number;
    createdAt: Date;
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

export type invPackageType = 'AGRICULTURE' | 'FOREX' | 'REAL_ESTATE' | 'INHERITANCE' | 'ENERGY' | 'CRYPTOCURRENCY' | 'METAL'
export type BASIC = 'AGRICULTURE' | 'FOREX'
export type PREMIUM = 'REAL_ESTATE' | 'INHERITANCE'
export type VIP = 'ENERGY' | 'CRYPTOCURRENCY' | 'METAL'