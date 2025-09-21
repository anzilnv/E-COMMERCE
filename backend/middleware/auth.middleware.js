import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';


export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ message: 'Unauthorized: No access token provided' });
        }

        try {
            const descoded = jwt.verify(accessToken, process.env.ACCESS_SECRET);
            const user = await User.findById(descoded.userId).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized: User not found' });
            }

            req.user = user; // Attach user to request object
            next();

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized: Token expired' });
            }
            throw error;
        }
    } catch (error) {
        console.log("Error in protectRoute Middleware :", error.message);
        return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
}
export const adminRoute = (req, res, next) => {
    if (req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: 'Access deneid - Admins only' });
    }
}