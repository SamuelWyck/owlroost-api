class PaginationManger {
    postTakeNum = 5;


    calcPostSkip(pageNum) {
        return (this.postTakeNum - 1) * pageNum;
    };
};



module.exports = new PaginationManger();