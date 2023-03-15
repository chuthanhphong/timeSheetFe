import { request } from "../utils/apiCore";

const BASE_RULE_API = "rule";

export const getAllRules = async () => {
  return await request({
    url: `${BASE_RULE_API}/all`,
    method: "GET"
  });
};

export const getRuleById = async (id: String) => {
  return await request({
    url: `${BASE_RULE_API}/${id}`,
    method: "GET"
  });
};

export const createRule = async (data) => {
  return await request({
    url: `${BASE_RULE_API}/create`,
    method: "POST",
    data
  });
};

export const deleteRuleById = async (id: number) => {
  return await request({
    url: `${BASE_RULE_API}/${id}`,
    method: "DELETE"
  });
};

export const updateRuleById = async (id: number, data) => {
  return await request({
    url: `${BASE_RULE_API}/${id}`,
    method: "PUT",
    data
  });
};
