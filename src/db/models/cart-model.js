import { model } from "mongoose";
import { CartSchema } from "../schemas/Cart-schema";

const Cart = model("Carts", CartSchema);

export class CartModel {
  async findByCustomerEmail(email) {
    const cartLists = await Cart.find({ email });
    return cartLists;
  }
}

const cartModel = new CartModel();

export { cartModel };
