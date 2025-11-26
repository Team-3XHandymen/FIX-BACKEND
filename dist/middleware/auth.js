"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProvider = exports.requireClient = exports.authorize = exports.auth = void 0;
const auth = (req, res, next) => {
    try {
        const userId = req.header('X-User-ID');
        const userType = req.header('X-User-Type');
        console.log('Auth middleware - Headers:', {
            'X-User-ID': userId,
            'X-User-Type': userType,
            'Content-Type': req.header('Content-Type'),
            'Origin': req.header('Origin')
        });
        if (!userId) {
            console.log('Auth middleware - No user ID provided');
            res.status(401).json({
                success: false,
                message: 'Access denied. User ID not provided.',
            });
            return;
        }
        if (!userType || !['client', 'provider'].includes(userType)) {
            console.log('Auth middleware - Invalid user type:', userType);
            res.status(401).json({
                success: false,
                message: 'Access denied. Invalid user type.',
            });
            return;
        }
        req.user = {
            id: userId,
            type: userType,
        };
        console.log('Auth middleware - User authenticated:', req.user);
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Authentication failed.',
        });
        return;
    }
};
exports.auth = auth;
const authorize = (...userTypes) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Access denied. User not authenticated.',
            });
            return;
        }
        if (!req.user.type || !userTypes.includes(req.user.type)) {
            res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
exports.requireClient = (0, exports.authorize)('client');
exports.requireProvider = (0, exports.authorize)('provider');
//# sourceMappingURL=auth.js.map