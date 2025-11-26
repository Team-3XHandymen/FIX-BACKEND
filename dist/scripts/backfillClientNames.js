"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var Booking_1 = require("../models/Booking");
var Client_1 = require("../models/Client");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function backfillClientNames() {
    return __awaiter(this, void 0, void 0, function () {
        var MONGODB_URI, bookings, updatedCount, skippedCount, _i, bookings_1, booking, client, clientName, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 13, , 14]);
                    MONGODB_URI = process.env.MONGODB_URI;
                    if (!MONGODB_URI) {
                        console.error('❌ MONGODB_URI not found in environment variables');
                        process.exit(1);
                    }
                    return [4 /*yield*/, mongoose_1.default.connect(MONGODB_URI)];
                case 1:
                    _a.sent();
                    console.log('✅ Connected to MongoDB');
                    return [4 /*yield*/, Booking_1.Booking.find({ $or: [{ clientName: { $exists: false } }, { clientName: '' }] })];
                case 2:
                    bookings = _a.sent();
                    console.log("\uD83D\uDCCA Found ".concat(bookings.length, " bookings without clientName"));
                    updatedCount = 0;
                    skippedCount = 0;
                    _i = 0, bookings_1 = bookings;
                    _a.label = 3;
                case 3:
                    if (!(_i < bookings_1.length)) return [3 /*break*/, 11];
                    booking = bookings_1[_i];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 9, , 10]);
                    return [4 /*yield*/, Client_1.Client.findOne({ userId: booking.clientId })];
                case 5:
                    client = _a.sent();
                    if (!client) return [3 /*break*/, 7];
                    clientName = client.name || client.username || 'Client';
                    return [4 /*yield*/, Booking_1.Booking.findByIdAndUpdate(booking._id, {
                            $set: { clientName: clientName }
                        })];
                case 6:
                    _a.sent();
                    updatedCount++;
                    console.log("\u2705 Updated booking ".concat(booking._id, " with clientName: ").concat(clientName));
                    return [3 /*break*/, 8];
                case 7:
                    skippedCount++;
                    console.log("\u26A0\uFE0F  Client not found for booking ".concat(booking._id, " (userId: ").concat(booking.clientId, ")"));
                    _a.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_1 = _a.sent();
                    console.error("\u274C Error updating booking ".concat(booking._id, ":"), error_1);
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 3];
                case 11:
                    console.log('\n📊 Migration Summary:');
                    console.log("\u2705 Successfully updated: ".concat(updatedCount, " bookings"));
                    console.log("\u26A0\uFE0F  Skipped (client not found): ".concat(skippedCount, " bookings"));
                    return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 12:
                    _a.sent();
                    console.log('✅ Disconnected from MongoDB');
                    return [3 /*break*/, 14];
                case 13:
                    error_2 = _a.sent();
                    console.error('❌ Migration error:', error_2);
                    process.exit(1);
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
// Run the migration
backfillClientNames();
