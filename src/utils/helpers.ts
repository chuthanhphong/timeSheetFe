import type { Route } from "antd/es/breadcrumb/Breadcrumb";
/*
  param:
    String: word
  return:
    String: word
  description: Capitalize a word.
  exception: None
*/
export const capitalizeSingleWord = (word: String): String => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

/*
  param:
    String: words
  return:
    String: words
  description: Capitalize all words in a string. E.g: "abc xyz" => "Abc Xyz".
  exception: None
*/
export const capitalizeMultipleWords = (words: String): String => {
  return words
    .split(" ")
    .map((word) => capitalizeSingleWord(word))
    .join(" ");
};

/*
  param: None
  return: 
    Route[] routes
  description: Use path URL to get the route of page.
  exception: None
*/

export const getRoutes = (): Route[] => {
  const pathArray = location.pathname.split("/").slice(1);
  return [
    { path: "/", breadcrumbName: "Home" },
    ...pathArray.map((path) => {
      return {
        path,
        breadcrumbName: capitalizeSingleWord(path)
      } as Route;
    })
  ];
};
