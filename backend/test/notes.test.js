import chai from "chai";
import chaiHttp from "chai-http";
import app from "../app.js";

chai.use(chaiHttp);
const { expect } = chai;

let token;
let userId;
let createdNoteId;

describe("Notes API Tests", () => {

  
  before(async () => {
    const resRegister = await chai.request(app)
      .post("/api/users/register")
      .send({
        name: "Test User",
        email: `testuser${Date.now()}@example.com`,
        password: "123456",
      });

    expect(resRegister).to.have.status(201);
    userId = resRegister.body.user.id;

    const resLogin = await chai.request(app)
      .post("/api/users/login")
      .send({ email: resRegister.body.user.email, password: "123456" });

    expect(resLogin).to.have.status(200);
    token = resLogin.body.token;
  });

  it("should add a new note", async () => {
    const res = await chai.request(app)
      .post("/api/notes/add")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Note",
        description: "This is a note created during testing",
        user_id: userId, 
      });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("message", "Note added successfully");
    expect(res.body.note).to.have.property("title", "Test Note");
    createdNoteId = res.body.note.id; 
  });

  it("should fetch all notes for the user", async () => {
    const res = await chai.request(app)
      .post("/api/notes/get")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: userId });

    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body[0]).to.have.property("title", "Test Note");
  });

  it("should fetch a single note by ID", async () => {
    const res = await chai.request(app)
      .get(`/api/notes/${createdNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("id", createdNoteId);
    expect(res.body).to.have.property("title", "Test Note");
  });

});
