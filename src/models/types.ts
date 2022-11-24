import { Types } from "mongoose"

export type ID = Types.ObjectId | string

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
}

export interface IInvestmentReq {
    investor: ID;
    investmentPlan: PLANS;
    investmentPackage: number;
    investmentAmount: number;
}

export interface IInvestment {
    investor: ID;
    investmentPlan: PLANS;
    investmentPackage: string;
    investmentAmount: number;
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
    APPROVED = 'APPROVED'
}

export type invPackageType = 'AGRICULTURE' | 'FOREX' | 'REAL_ESTATE' | 'INHERITANCE' | 'ENERGY' | 'CRYPTOCURRENCY' | 'METAL'
export type BASIC = 'AGRICULTURE' | 'FOREX'
export type PREMIUM = 'REAL_ESTATE' | 'INHERITANCE'
export type VIP = 'ENERGY' | 'CRYPTOCURRENCY' | 'METAL'