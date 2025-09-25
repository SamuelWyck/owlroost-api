class PaginationManger {
    postTakeNum = 21;


    calcPostSkip(pageNum) {
        return (this.postTakeNum - 1) * pageNum;
    };
};



module.exports = new PaginationManger();