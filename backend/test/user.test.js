import chai from "chai";
import chaiHttp from "chai-http";
import app from "../app.js";

chai.use(chaiHttp);
const { expect } = chai;

describe("User API Tests", () => {
 
  const testUser = { name: "Test User", email: "test@example.com", password: "123456" };

  before(async () => {
  
    await chai.request(app).post("/api/users/register").send(testUser);
  });

  it("should register a new user", async () => {
    const res = await chai.request(app)
      .post("/api/users/register")
      .send({
        name: "Moatasim",
        email: `moatasim${Date.now()}@example.com`,
        password: "123456",
      });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("message").that.equals("User registered successfully");
    expect(res.body.user).to.have.property("email");
  });

  it("should login successfully with valid credentials", async () => {
    const res = await chai.request(app)
      .post("/api/users/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("message").that.equals("Login successful");
    expect(res.body).to.have.property("token");
  });

  it("should fail with invalid credentials", async () => {
    const res = await chai.request(app)
      .post("/api/users/login")
      .send({ email: "wrong@example.com", password: "wrongpass" });


    expect(res).to.have.status(400); 
    expect(res.body).to.have.property("message").that.equals("Invalid email or password");
  });
});
