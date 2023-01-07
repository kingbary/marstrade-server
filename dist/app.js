"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const dashboard_route_1 = __importDefault(require("./routes/dashboard.route"));
const investment_route_1 = __importDefault(require("./routes/investment.route"));
const wallet_route_1 = __importDefault(require("./routes/wallet.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const errorHandler_1 = require("./middleware/errorHandler");
const corsOptions_1 = __importDefault(require("./config/corsOptions"));
exports.app = (0, express_1.default)();
// built-in middlewre for receiving and parsing json data.
exports.app.use(express_1.default.json());
// built-in middleware for serving static files (CSS).
exports.app.use('/', express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
// 3rd party middleware for handling cors.
exports.app.use((0, cors_1.default)(corsOptions_1.default));
// 3rd party middleware for handling cookies.
exports.app.use((0, cookie_parser_1.default)());
// Route handlers
// app.use('/', rootRoute) // home route
exports.app.use('/v1/auth', auth_route_1.default); // home route
exports.app.use('/v1/dashboard', dashboard_route_1.default); // get dashboard
exports.app.use('/v1/investment', investment_route_1.default); // transactions (make investment, make withrawal, get history)
exports.app.use('/v1/user', user_route_1.default); // account profile ( see users, delete user, update profile, update avatar, change password)
exports.app.use('/v1/wallet', wallet_route_1.default); // add wallet, remove wallet
// SERVE REACT BUILD AS A STATIC FILE.
exports.app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'build')));
exports.app.get('/*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '..', 'build', 'index.html'));
});
exports.app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path_1.default.join(__dirname, '..', 'views', '404.html'));
    }
    else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' });
    }
    else {
        res.type('txt').send('404 Not Found');
    }
});
// error handling middleware
exports.app.use(errorHandler_1.errHandler);
