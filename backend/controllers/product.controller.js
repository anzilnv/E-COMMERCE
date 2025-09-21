import Product from "../model/product.model.js";
import { redis } from "../lib/redis.js";
import cloudnary from "../lib/cloudnary.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        console.log("Error in getAllProducts Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}
export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_Products");
        if (featuredProducts) {
            console.log("Featured products fetched from Redis");
            return res.json(JSON.parse(featuredProducts));
        }

        // if not in redis , fecth from mongo db
        // lean() to get plain JS object instead of Mongoose document
        // improves performance
        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }

        // store in redis for quick access
        await redis.set("featured_Products", JSON.stringify(featuredProducts), 'EX', 3600); // Cache for 1 hour

        res.json(featuredProducts);
    } catch (error) {
        console.log("Error in getfeaturedProducts Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image } = req.body;

        let cloudnaryResponse = null;
        if (image) {
            cloudnaryResponse = await cloudnary.uploader.upload(image, {
                folder: "products"
            })
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            image: cloudnaryResponse ? cloudnaryResponse.secure_url : ""
        })
        res.status(201).json(product);
    } catch (error) {
        console.log("Error in createProduct Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudnary.uploader.destroy(`products/${publicId}`);
                console.log("deleted from cloudnary");
            } catch (error) {
                console.log("error deleting from cloudnary", error.message);
            }
        }
        await product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error in deleteProduct Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}

export const getRecommendationProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 5 } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    image: 1,
                    description: 1
                }
            }
        ]);

        res.json(products);
    } catch (error) {
        console.log("Error in getRecommendationProducts Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}
export const getProductByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category });
        res.json(products);
    } catch (error) {
        console.log("Error in getProductByCategory Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}
export const toggleFeaturedProduct = async (req, res) => {

    try {
        const product = await Product.findById(req.params.id)
        if (product) {
            product.isFeatured = !product.isFeatured
            const updatedProduct = await product.save()
            await updateProductFeaturedCache();
            res.status(200).json({ message: "Product feature status toggled", updatedProduct })
        } else {
            res.status(404).json({ message: "Product not found" })
        }
    } catch (error) {
        console.log("Error in toggleFeaturedProduct Controller :", error.message);
        res.status(500).json({ error: error.message });
    }
}

async function updateProductFeaturedCache() {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_Products", JSON.stringify(featuredProducts)); // Cache for 1 hour
        console.log("Featured products cache updated");
    } catch (error) {
        console.log("Error updating featured products cache:", error.message);
    }
}
// Additional CRUD operations can be added here (create, update, delete, get by id, etc.)