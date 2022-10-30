import { Types } from "mongoose"

export type ID = Types.ObjectId | string

export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    verified: boolean;
    avatar?: string;
}

export interface IDashboard {
    owner: ID;
    referralLink: string;
    referrals: number;
    hasInvestment: boolean;
    investment?: {
        investmentPlan: string;
        investmentPackage: string;
        investmentAmount: number;
        ROI: number;
    }
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
    investmentPackage: number;
    investmentAmount: number;
    status: STATUS,
    isActive: boolean;
    ROI: number;
    createdAt: Date;
}

export enum  PLANS {
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
    VIP = 'VIP'
}

export enum STATUS {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED'
}

export type invPackageType = 'AGRICULTURE' | 'FOREX' | 'STOCK' | 'INHERITANCE' | 'ENERGY' | 'CRYPTOCURRENCY' | 'METAL'
export type BASIC = 'AGRICULTURE' | 'FOREX'
export type PREMIUM = 'STOCK' | 'INHERITANCE'
export type VIP = 'ENERGY' | 'CRYPTOCURRENCY' | 'METAL'