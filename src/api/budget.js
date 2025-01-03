const { Router } = require("express");
const Budget = require("../model/schema");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const entries = await Budget.find();
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const budget = new Budget(req.body);
    const createdBudget = await budget.save();
    res.json(createdBudget);
  } catch (error) {
    console.log(error.name);
    if (error.name === "ValidationError") {
      res.status(422);
    }
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updatedBudget);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await Budget.deleteOne({ _id: req.params.id });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/balance", async (req, res, next) => {
  try {
    const expenses = await Budget.aggregate([
      { $match: { type: "expense" } },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
        },
      },
    ]);

    const income = await Budget.aggregate([
      { $match: { type: "income" } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$amount" },
        },
      },
    ]);

    // Safely extract values or use 0 if the array is empty
    const totalExpenses = expenses.length > 0 ? expenses[0].totalExpenses : 0;
    const totalIncome = income.length > 0 ? income[0].totalIncome : 0;

    // Calculate balance
    const balance = (totalIncome - totalExpenses).toFixed(2);

    res.json({
      expenses: totalExpenses,
      income: totalIncome,
      balance,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
