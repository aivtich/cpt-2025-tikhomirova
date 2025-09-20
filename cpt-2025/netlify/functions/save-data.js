exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod === "POST") {
    try {
      const { studentName, group } = JSON.parse(event.body);
      
      console.log("Данные для сохранения:", { studentName, group });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: "Данные сохранены!", 
          studentName: studentName,
          group: group 
        })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Ошибка при сохранении" })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: "Метод не разрешен" })
  };
};