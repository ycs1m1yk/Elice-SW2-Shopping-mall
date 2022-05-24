import { Schema } from 'mongoose';

const ProductSchema = new Schema(
  {
    productId: {
       type: Number,
       required: true, 
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: false,
      default: 0,
    },
    img: {

    },
    size: {
        type: Number,
        required: false,
        default: 0,
    },
    brandName: {
        type: String,
        required: false,
        default: "",
    },
    keyword: {
        type: String,
        required: false, 
    },
    decription: {
        type: String,
        required: true,
    },
    

    },
    {
    collection: 'users',
    timestamps: true,
  }
);

export { ProductSchema };