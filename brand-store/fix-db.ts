import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');
  
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  const products = await Product.find({ images: "https://res.cloudinary.com/de4dqxdt1/image/upload/v1/products/sample.jpg" });
  console.log('Found', products.length, 'products with broken image');
  
  for (const p of products) {
    const updatedImages = p.get('images').map((img: string) => 
      img === "https://res.cloudinary.com/de4dqxdt1/image/upload/v1/products/sample.jpg" 
        ? "https://placehold.co/600x800/F0E6D2/2C1810?text=Sample" 
        : img
    );
    await Product.updateOne({ _id: p._id }, { $set: { images: updatedImages } });
  }
  
  console.log('Fixed products');
  mongoose.disconnect();
}
fix().catch(console.error);
