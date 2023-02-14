// By default jest does not work with the new import syntax
// We should add NODE_OPTIONS=--experimental-vm-modules to the test script in package.json to enable the usage of import syntax
// On Windows you cannot use NODE_OPTIONS (and all env vars) from command line --> YOU HAVE TO USE CROSS-ENV PACKAGE TO BE ABLE TO PASS
// ENV VARS TO COMMAND LINE SCRIPTS ON ALL OPERATIVE SYSTEMS!!!

import supertest from "supertest";
import dotenv from "dotenv";
import mongoose from "mongoose";
import server from "../src/server.js";
import ProductsModel from "../src/api/products/model.js";
import { response } from "express";

dotenv.config(); // This command forces .env vars to be loaded into process.env. This is the way to do it whenever you can't use -r dotenv/config

// supertest is capable of executing server.listen of our Express app if we pass the Express server to it
// It will give us back a client that can be used to run http requests on that server

const client = supertest(server);

/* describe("Test APIs", () => {
  it("Should test that GET /test endpoint returns 200 and a body containing a message", async () => {
    const response = await client.get("/test")
    expect(response.status).toBe(200)
    expect(response.body.message).toEqual("Test successfull")
  })
})
 */

const validProduct = {
  name: "A valid product",
  description: "balllablalblabl",
  price: 100,
};
const fakeId = 123456123456123456123456;
const notValidProduct = {
  name: "A not valid product",
  price: 100,
};

const validChange = {
  name: "Changed Name of product",
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL_TEST);
  const product = new ProductsModel({
    name: "test",
    description: "blalblabla",
    price: 20,
  });
  await product.save();
});
// beforeAll is a Jest hook ran before all the tests, usually it is used to connect to the db and to do some initial setup (like inserting some mock data in the db)

afterAll(async () => {
  await ProductsModel.deleteMany();
  await mongoose.connection.close();
});
// afterAll hook could be used to clean up the situation (close the connection to Mongo gently and clean up db/collections)

describe("Test APIs", () => {
  it("Should test that the env vars are set correctly", () => {
    expect(process.env.MONGO_URL_TEST).toBeDefined();
  });

  it("Should test that POST /products returns a valid _id and 201", async () => {
    const response = await client
      .post("/products")
      .send(validProduct)
      .expect(201);
    expect(response.body._id).toBeDefined();
  });

  it("Should test that PUT /products/:id with a valid product returns a 205", async () => {
    const response = await client.post("/products").send(validProduct);
    await client
      .put(`/products/${response.body._id}`)
      .send(validChange)
      .expect(205);
    const changedProduct = await client.get(`/products/${response.body._id}`);
    expect(changedProduct.body.name).toBeDefined();
    expect(response.body.name).not.toBe(changedProduct.body.name);
  });
  it("Should test that GET /products/:id with a valid id returns a 200", async () => {
    const response = await client.post("/products").send(validProduct);
    const product = await client
      .get(`/products/${response.body._id}`)
      .expect(200);
    expect(product.body).toBeDefined();
    expect(response.body._id).toBe(product.body._id);
  });

  it("Should test that GET /products/:id with a fake id returns a 404", async () => {
    const product = await client
      .get(`/products/123456123456123456123456`)
      .expect(404);
  });
  it("Should test that DELETE /products/:id with a valid product returns a 204", async () => {
    const response = await client.post("/products").send(validProduct);
    await client.delete(`/products/${response.body._id}`).expect(204);
  });

  it("Should test that PUT /products/:id with a not valid product returns a 404", async () => {
    const response = await client.post("/products").send(validProduct);
    await client
      .put(`/products/123456123456123456123456`)
      .send(validChange)
      .expect(404);
  });

  it("Should test that DELETE /products/:id with a not valid product returns a 404", async () => {
    const response = await client.post("/products").send(validProduct);
    await client.delete(`/products/123456123456123456123456`).expect(404);
  });

  it("Should test that GET /products returns a success status and a body", async () => {
    const response = await client.get("/products").expect(200);
    console.log(response.body);
  });

  it("Should test that POST /products with a not valid product returns a 400", async () => {
    await client.post("/products").send(notValidProduct).expect(400);
  });
});
