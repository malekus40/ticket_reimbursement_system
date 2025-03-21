const userDAO = require("../repository/userDAO")
//const uuid = require("uuid");
const bcrypt = require("bcryptjs");

async function createUser(user) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    if (validateUser(user)) {
        const data = await userDAO.createUser({
            username: user.username,
            hashedPassword
        });
        return data;
    } else {
        return null;
    }
}

async function validateLogin(username, password) {
    const user = await getUserByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
        return user;
    } else {
        return null;
    }
}

async function getUserByUsername(username) {
    if (username) {
        const data = await userDAO.getUserByUsername(username);
        if (data) {
            return data;
        } else {
            return null;
        }
    } else {
        return null;
    }
}
function validateUser(user) {
    const usernameResult = user.username.length > 0;
    const passwordResult = user.password.length > 0;
    return (usernameResult && passwordResult);
}

// async function updateUserRole(username, newRole) {
//     const allowedRoles = ["employee", "manager"];
//     if (!allowedRoles.includes(newRole)) {
//         return null;
//     }
//     try {
//         const updatedUser = await userDAO.updateUserRole(username, newRole);
//         return updatedUser;
//     } catch (err) {
//         console.error("Error updating user role:", err);
//         return null;
//     }
// }

module.exports = {
    createUser,
    validateLogin,
    getUserByUsername,
    //updateUserRole
}