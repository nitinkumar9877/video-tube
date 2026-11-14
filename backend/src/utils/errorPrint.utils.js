const printCatchBlockError = (error) => {
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error status:", error.status);
};

module.exports = { printCatchBlockError };