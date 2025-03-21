const userService = require('../src/services/userService');
const userDAO = require('../src/repository/userDAO');
const bcrypt = require("bcryptjs");

// Mock the userDAO module so that it doesn't perform actual database operations
jest.mock('../src/repository/userDAO');

describe('User Service', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('createUser returns user data when valid input is provided', async () => {
        const sampleUser = {
            username: "johndoe",
            password: "password123",
            email: "john@example.com"
        };
        const fakeUser = {
            PK: "USER#johndoe",
            SK: "PROFILE",
            itemType: "USER",
            username: sampleUser.username,
            password: "hashedpassword",
            role: "employee",
            created_at: expect.any(String)
        };

        userDAO.createUser.mockResolvedValue(fakeUser);

        const result = await userService.createUser(sampleUser);

        expect(result).toMatchObject({
            username: "johndoe",
            role: "employee"
        });
    });

    test("should return null when invalid data is provided", async () => {

        const invalidUser = {
            username: "",
            password: "password123"
        };


        const result = await userService.createUser(invalidUser);


        expect(result).toBeNull();
        expect(userDAO.createUser).not.toHaveBeenCalled();
    });

    describe("getUserByUsername", () => {
        test("should return user data if userDAO returns data", async () => {
            
            const username = "johndoe";
            const fakeUser = {
                username: "johndoe",
                password: "hashedPassword123"
            };

            userDAO.getUserByUsername.mockResolvedValue(fakeUser);

          
            const result = await userService.getUserByUsername(username);

           
            expect(result).toEqual(fakeUser);
            expect(userDAO.getUserByUsername).toHaveBeenCalledWith(username);
        });

        test("should return null if no username is provided", async () => {
            const result = await userService.getUserByUsername("");
            expect(result).toBeNull();
        });

        test("should return null if DAO returns null", async () => {
            const username = "nonexistent";
            userDAO.getUserByUsername.mockResolvedValue(null);
            const result = await userService.getUserByUsername(username);
            expect(result).toBeNull();
        });
    });

    describe("validateLogin", () => {
        test("should return user if credentials are valid", async () => {
          
          const username = "johndoe";
          const plainPassword = "password123";
          const hashedPassword = await bcrypt.hash(plainPassword, 10);
          const fakeUser = {
            username: "johndoe",
            password: hashedPassword,
            role: "employee"
          };
    
         
          userDAO.getUserByUsername.mockResolvedValue(fakeUser);
    
         
          const result = await userService.validateLogin(username, plainPassword);
    
        
          expect(result).toEqual(fakeUser);
        });
    
        test("should return null if password does not match", async () => {
          const username = "johndoe";
          const plainPassword = "wrongpassword";
          const hashedPassword = await bcrypt.hash("correctpassword", 10);
          const fakeUser = {
            username: "johndoe",
            password: hashedPassword,
            role: "employee"
          };
    
          userDAO.getUserByUsername.mockResolvedValue(fakeUser);
    
          const result = await userService.validateLogin(username, plainPassword);
          expect(result).toBeNull();
        });
    
        test("should return null if no user is found", async () => {
          const username = "unknown";
          const plainPassword = "anyPassword";
    
          userDAO.getUserByUsername.mockResolvedValue(null);
    
          const result = await userService.validateLogin(username, plainPassword);
          expect(result).toBeNull();
        });
      });
});

