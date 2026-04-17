const user = require("../modules/user.module");
const suser = require("../modules/subUser.module");
const { v4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function tempAdmin(req, res) {
  const { payload } = req.body;

  const hasedPass = await bcrypt.hash(payload.pass, 10);

  const findExistinguser = await user.findOne({ user_email: payload.email });

  if (findExistinguser) {
    return res.json({ error: "user already exist", status: 404 });
  }

  const tSet = new suser({
    uuid: v4(),
    user_name: payload.name,
    user_email: payload.email,
    user_pass: hasedPass,
    user_username: payload.username,
    user_role: "user",
    createAt: new Date(),
    is_active: true,
  });
  await tSet.save();

  if (!tSet) {
    return res.json({ error: "Data not saved", status: 404 });
  }

  return res.json({ message: "Data saved Succesfull", status: 200 });
}

async function login(req, res) {
  const { payload } = req.body;


  const hasedPass = await bcrypt.hash(payload.pass, 10);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);

  if (isEmail) {
    findExistinguser = await user.findOne({ user_email: payload.email });
  } else {
    findExistinguser = await user.findOne({ user_username: payload.email });
  }

  if (findExistinguser) {
    const passMatch = await bcrypt.compare(
      payload.pass,
      findExistinguser.user_pass,
    );
    if (!passMatch) {
      return res.json({ error: "pasword not matched", status: 500 });
    }
    if (findExistinguser.is_active === false) {
      return res.json({ error: "Account not active", status: 500 });
    }
  } else {
    return res.json({ error: "No user Found", status: 404 });
  }
  console.log(process.env.SECRET_KEY);
  const token = jwt.sign(
    {
      uuid: findExistinguser.uuid,
      role: findExistinguser.user_role,
      name: findExistinguser.user_name,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1d" },
  );

  const response = res.cookie("user", token, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
    sameSite: "Lax",
  });

  return (
    response,
    res.json({
      message: "User login successful",
      status: 200,
      token,
    })
  );
}

async function logout(req, res) {
  const response = res.clearCookie("user", {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "Lax",
  });
  return (response, res.json({ mnessage: "Logout successfull", status: 200 }));
}

module.exports = {
  tempAdmin,
  login,
  logout,
};
