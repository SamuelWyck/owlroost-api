const multer = require("multer");



function fileName(req, file, cb) {
    const fileParts = file.originalname.split(".");
    const extIndex = fileParts.length - 1;
    const fileExt = fileParts[extIndex];
    cb(null, `${Date.now()}.${fileExt}`);
};


function fileFilter(req, file, cb) {
    try {
        const fileParts = file.originalname.split(".");
        if (fileParts.length === 1) {
            return cb(null, false);
        }
    
        const extIndex = fileParts.length - 1;
        const fileExt = fileParts[extIndex];
        const extRegex = /^(png|jpe?g)$/i;
        
        const match = fileExt.match(extRegex);
        if (!match) {
            return cb(null, false);
        }
    
        cb(null, true);
    } catch (error) {
        cb(error);
    }
};


const storage = multer.diskStorage({
    destination: "uploads/",
    filename: fileName
});


const megaByte = 1000000;

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: megaByte * 3}
});



module.exports = upload;