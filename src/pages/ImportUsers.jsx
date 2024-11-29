// App.js
import React, { useState } from 'react';
import { Upload, Button, Table, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Проверяем и форматируем данные
      const formattedData = sheetData.map((item, index) => ({
        key: index,
        name: item.name || 'Не указано',
        debtTotal: Number(item.debtTotal || 0),
        history: item.history ? JSON.parse(item.history) : [],
      }));

      setData(formattedData);
      notification.success({ message: 'Файл загружен!', description: 'Данные успешно обработаны.' });
    };
    reader.readAsBinaryString(file);
    return false;
  };

  const uploadDataToAPI = async () => {
    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of data) {
      try {
        await axios.post('https://649853cd515dd1de.mokky.dev/items', {
          name: item.name,
          debtTotal: item.debtTotal,
          history: item.history,
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Ошибка при добавлении пользователя: ${item.name}`, error);
        notification.error({
          message: `Ошибка при добавлении: ${item.name}`,
          description: error.message,
        });
      }
    }

    setLoading(false);

    notification.info({
      message: 'Результаты загрузки',
      description: `Успешно добавлено: ${successCount}, Ошибок: ${errorCount}`,
    });
  };

  const columns = [
    { title: 'Имя', dataIndex: 'name', key: 'name' },
    { title: 'Общий долг', dataIndex: 'debtTotal', key: 'debtTotal' },
    { title: 'История', dataIndex: 'history', key: 'history' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Импорт долгов покупателей</h1>
      <Upload
        beforeUpload={handleFileUpload}
        accept=".xlsx, .xls"
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Загрузить XLSX файл</Button>
      </Upload>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="key"
        style={{ marginTop: '20px' }}
      />
      <Button
        type="primary"
        onClick={uploadDataToAPI}
        loading={loading}
        disabled={!data.length}
        style={{ marginTop: '20px' }}
      >
        Отправить данные в API
      </Button>
    </div>
  );
};

export default App;
