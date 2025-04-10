// Script to add data to the database
'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const users = [
    { utorid: "clive123", password: "SuperUser123!", name: "clive123", email: "clive.su@mail.utoronto.ca", verified: true, role: "superuser" },
    { utorid: "johndoe1", password: "Password123!", name: "John Doe", email: "johndoe1@mail.utoronto.ca", verified: false, role: "regular" },
    { utorid: "newuser1", password: "Password123!", name: "Reg User 1", email: "newuser1@mail.utoronto.ca", verified: false, role: "regular" },
    { utorid: "newuser2", password: "Password123!", name: "Reg User 2", email: "newuser2@mail.utoronto.ca", verified: false, role: "regular" },
    { utorid: "newuser3", password: "Password123!", name: "Reg User 3", email: "newuser3@mail.utoronto.ca", verified: false, role: "regular" },
    { utorid: "newuser4", password: "Password123!", name: "Reg User 4", email: "newuser4@mail.utoronto.ca", verified: false, role: "regular" },
    { utorid: "newuser5", password: "Password123!", name: "Reg User 5", email: "newuser5@mail.utoronto.ca", verified: false, role: "regular" },
    { utorid: "newuser6", password: "Password123!", name: "Reg User 6", email: "newuser6@mail.utoronto.ca", verified: false, role: "regular" },
    { utorid: "manuser1", password: "Password123!", name: "Manager 1", email: "manager1@mail.utoronto.ca", verified: false, role: "manager" },
    { utorid: "casuser1", password: "Password123!", name: "Cashier 1", email: "cashier1@mail.utoronto.ca", verified: false, role: "cashier" },
    { utorid: "orguser1", password: "Password123!", name: "Organizer 1", email: "organize1@mail.utoronto.ca", verified: false, role: "regular" },
];

// TODO: add transactions
const transactions = [
    { utorid: "johndoe1", type: "purchase", spent: 10.00, amount: 40, createdBy: "clive123", suspicious: false },
    { utorid: "johndoe1", type: "purchase", spent: 50, amount: 200, createdBy: "casuser1", suspicious: false, remark: "Big splurge" },
    { utorid: "newuser1", amount: 80, type: "purchase", spent: 20, suspicious: false, createdBy: "casuser1" },
    { utorid: "johndoe1", amount: -10, type: "redemption", redeemed: 10, relatedId: 10, createdBy: "johndoe1", processed: true },
    { utorid: "johndoe1", amount: 40, type: "purchase", spent: 10, suspicious: false, createdBy: "manuser1" },
    { utorid: "clive123", amount: 80, type: "purchase", spent: 20, suspicious: false, createdBy: "clive123" },
    { utorid: "clive123", amount: -10, type: "transfer", relatedId: 3, remark: "coffee", createdBy: "clive123" },
    { utorid: "newuser1", amount: 10, type: "transfer", relatedId: 1, remark: "coffee", createdBy: "clive123" },
    { utorid: "newuser1", amount: -5, type: "redemption", createdBy: "newuser1", processed: false },
    { utorid: "clive123", amount: -10, type: "redemption", createdBy: "clive123", processed: false },
    { utorid: "newuser2", amount: 80, type: "purchase", spent: 20, suspicious: false, createdBy: "clive123" },
    { utorid: "newuser3", amount: 40, type: "purchase", spent: 10, suspicious: false, createdBy: "clive123" },
    { utorid: "newuser4", amount: 120, type: "purchase", spent: 30, suspicious: false, createdBy: "clive123" },
    { utorid: "newuser6", amount: 4, type: "purchase", spent: 1, suspicious: false, createdBy: "manuser1" },
    { utorid: "newuser6", amount: 2, type: "adjustment", suspicious: false, relatedId: 14, createdBy: "clive123" },
    { utorid: "johndoe1", amount: 200, type: "adjustment", suspicious: false, relatedId: 2, createdBy: "clive123" },
    { utorid: "johndoe1", amount: -1, type: "transfer", relatedId: 3, createdBy: "johndoe1" },
    { utorid: "newuser3", amount: 1, type: "transfer", relatedId: 1, createdBy: "johndoe1" },
    { utorid: "johndoe1", amount: -1, type: "transfer", relatedId: 3, createdBy: "johndoe1" },
    { utorid: "newuser3", amount: 1, type: "transfer", relatedId: 1, createdBy: "johndoe1" },
    { utorid: "johndoe1", amount: -1, type: "transfer", relatedId: 3, createdBy: "johndoe1" },
    { utorid: "newuser3", amount: 1, type: "transfer", relatedId: 1, createdBy: "johndoe1" },
    { utorid: "johndoe1", amount: 1, type: "adjustment", relatedId: 1, suspicious: false, createdBy: "manuser1" },
    { utorid: "clive123", amount: -1, type: "redemption", createdBy: "clive123", processed: false },
    { utorid: "clive123", amount: -30, type: "redemption", createdBy: "clive123", processed: false },
    { utorid: "newuser6", amount: 400, type: "event", relatedId: 3, remark: "1st place", createdBy: "manuser1" },
    { utorid: "newuser4", amount: 100, type: "event", relatedId: 3, remark: "2nd place", createdBy: "manuser1" },
    { utorid: "newuser2", amount: 50, type: "event", relatedId: 3, remark: "3rd place", createdBy: "manuser1" },
    { utorid: "newuser1", amount: 50, type: "event", relatedId: 5, remark: "Thank you for coming!", createdBy: "orguser1" },
    { utorid: "newuser3", amount: 50, type: "event", relatedId: 5, remark: "Thank you for coming!", createdBy: "orguser1" },
    { utorid: "newuser5", amount: 50, type: "event", relatedId: 5, remark: "Thank you for coming!", createdBy: "orguser1" },

];

// TODO: add events and promotions
const now = new Date();
const inOneMinute = new Date(now.getTime() + 60 * 1000);
const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);


const events = [
    { name: "Event 1", description: "Fun event happening soon", location: "Bahen", startTime: inOneMinute, endTime: inOneWeek, pointsRemain: 500, published: true },
    { name: "Event 2", description: "Week long retreat", location: "TBA", startTime: inOneWeek, endTime: inTwoWeeks, pointsRemain: 200, published: true },
    { name: "The Big Event", description: "Long event across the country", location: "Canada", startTime: inOneMinute, endTime: inTwoWeeks, pointsRemain: 5000, published: true },
    { name: "Competition", description: "other event", location: "USA", startTime: inOneMinute, endTime: inTwoWeeks, pointsRemain: 100, published: true },
    { name: "Lunchtime", description: "another event", location: "Toronto", startTime: inOneMinute, endTime: inTwoWeeks, pointsRemain: 50, published: true },
    { name: "Event 6", description: "Unpublished event", location: "TBA", startTime: inOneWeek, endTime: inTwoWeeks, pointsRemain: 50 },
    { name: "Event 7", description: "Another unpublished event", location: "TBA", startTime: inOneWeek, endTime: inTwoWeeks, pointsRemain: 150 },
    { name: "Event 8", description: "Future event", location: "Bahen", startTime: inOneWeek, endTime: inTwoWeeks, pointsRemain: 50 },
    { name: "Birthday Party", description: "Happy birthday", location: "My House", startTime: inOneWeek, endTime: inTwoWeeks, pointsRemain: 100 },
    { name: "Event 10", description: "Future event", location: "Bahen", startTime: inOneWeek, endTime: inTwoWeeks, pointsRemain: 250 },
    { name: "Event 11", description: "Future event", location: "Bahen", startTime: inOneWeek, endTime: inTwoWeeks, pointsRemain: 350 },
];

const promotions = [
    { name: "bonus Ten", description: "For every dollar spent, 10 extra points", type: "automatic", startTime: inOneMinute, endTime: inOneWeek, minSpending: 25, rate: 0.1, points: 0 },
    { name: "bonus Five", description: "For every dollar spent, 5 extra points", type: "automatic", startTime: inOneWeek, endTime: inTwoWeeks, minSpending: 10, rate: 0.05, points: 0 },
    { name: "bonus 50", description: "coupon for 50 points", type: "one-time", startTime: inOneMinute, endTime: inTwoWeeks, minSpending: 0, rate: 0, points: 50 },
    { name: "bonus 150", description: "coupon for 150 points", type: "one-time", startTime: inOneWeek, endTime: inTwoWeeks, minSpending: 0, rate: 0, points: 150 },
    { name: "Large purchase bonus", description: "bonus of 100 points for 50 dollars spent", type: "one-time", startTime: inOneMinute, endTime: inTwoWeeks, minSpending: 50, rate: 0, points: 100 },
    { name: "random", description: "fun promo", type: "one-time", startTime: inOneMinute, endTime: inTwoWeeks, minSpending: 100, rate: 0.5, points: 0 },
    { name: "fun", description: "future points", type: "one-time", startTime: inOneWeek, endTime: inTwoWeeks, minSpending: 49.99, rate: 0, points: 50 },
    { name: "thanksgiving 15", description: "Happy Thanksgiving!", type: "automatic", startTime: inOneMinute, endTime: inTwoWeeks, minSpending: 20, rate: 0.15, points: 0 },
    { name: "christmas 20", description: "Happy holidays", type: "automatic", startTime: inOneWeek, endTime: inTwoWeeks, minSpending: 10, rate: 0.2, points: 5 },
    { name: "back2school", description: "one more year", type: "one-time", startTime: inOneMinute, endTime: inOneWeek, minSpending: 0, rate: 0, points: 50 },
    { name: "small", description: "Small bonus!", type: "one-time", startTime: inOneMinute, endTime: inOneWeek, minSpending: 30, rate: 0.05, points: 0 },
]

async function addUsers() {
    for (let user of users) {
        const newUser = await prisma.user.create({ data: user });
        console.log(newUser);
    }
};

async function addTransactions() {
    for (let transaction of transactions) {
        const newTransaction = await prisma.transaction.create({ data: transaction });
        console.log(newTransaction);
    }
}

async function addEvents() {
    for (let event of events) {
        const newEvent = await prisma.event.create({ data: event });
        console.log(newEvent);
    }
}

async function addPromotions() {
    for (let promo of promotions) {
        const newPromo = await prisma.promotion.create({ data: promo });
        console.log(newPromo);
    }
}

async function addData() {
    await addUsers();
    await addEvents();
    await addPromotions();
    await addTransactions();
}

addData();