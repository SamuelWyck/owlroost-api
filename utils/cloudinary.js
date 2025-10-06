const cloudinary = require("cloudinary").v2;



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


async function uploadImage(filePath, assetFolder) {
    let image = null;
    try {
        image = await cloudinary.uploader.upload(
            filePath, 
            {
                asset_folder: assetFolder
            }
        );
    } catch (error) {
        console.log(error);
        return {errors: [{msg: "Error uploading image"}]};
    }
    return image;
};


async function deleteImage(public_id) {
    let res = null;
    try {
        res = await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.log(error);
        return {errors: [{msg: "Error deleting image"}]};
    }
    return res;
};



module.exports = {
    uploadImage,
    deleteImage
};