const express = require('express');
const fs = require('fs');
const app = express();

const fileName = './assets/grades.json';

app.use(express.json());

app.get('/grades?', function (_, res) {
  fs.readFile(fileName, 'utf-8', (err, data) => {
    try {
      if (err) throw err;
      let grades = JSON.parse(data);
      delete grades.nextId;
      res.send(grades);
    } catch {
      res.status(500).send(err.message);
    }
  });
});

app.get('/grades?/total/:student/:subject', function (req, res) {
  fs.readFile(fileName, 'utf-8', (err, data) => {
    try {
      if (err) throw err;
      const student = req.params.student;
      const subject = req.params.subject;
      let { grades } = JSON.parse(data);
      grades = grades.filter(
        (grade) => grade.student === student && grade.subject === subject
      );
      if (grades.length > 0) {
        const total = grades.reduce((cnt, grade) => cnt + grade.value, 0);
        res.send({ student, subject, 'Nota total': total });
      } else {
        res.status(404).send('Nenhuma nota encontrada com esses parâmetros.');
      }
    } catch {
      res.status(500).send(err.message);
    }
  });
});

app.get('/grades?/media/:subject/:type', function (req, res) {
  fs.readFile(fileName, 'utf-8', (err, data) => {
    try {
      if (err) throw err;
      const subject = req.params.subject;
      const type = req.params.type;
      let { grades } = JSON.parse(data);
      grades = grades.filter(
        (grade) => grade.type === type && grade.subject === subject
      );
      if (grades.length > 0) {
        const media =
          grades.reduce((cnt, grade) => cnt + grade.value, 0) / grades.length;
        res.send({ subject, type, 'Media total': media });
      } else {
        res.status(404).send('Nenhuma nota encontrada com esses parâmetros.');
      }
    } catch {
      res.status(500).send(err.message);
    }
  });
});

app.get('/grades?/top3/:subject/:type', function (req, res) {
  fs.readFile(fileName, 'utf-8', (err, data) => {
    try {
      if (err) throw err;
      const subject = req.params.subject;
      const type = req.params.type;
      let { grades } = JSON.parse(data);
      grades = grades.filter(
        (grade) => grade.type === type && grade.subject === subject
      );
      if (grades.length > 0) {
        const top3 = grades.sort((a, b) => b.value - a.value).slice(0, 3);
        res.send({ subject, type, 'Top 3': top3 });
      } else {
        res.status(404).send('Nenhuma nota encontrada com esses parâmetros.');
      }
    } catch {
      res.status(500).send(err.message);
    }
  });
});

app.get('/grades?/:id', function (req, res) {
  fs.readFile(fileName, 'utf-8', (err, data) => {
    try {
      if (err) throw err;
      const id = req.params.id;
      const { grades } = JSON.parse(data);
      const grade = grades.find((grade) => grade.id == id);
      if (grade) {
        res.send(grade);
      } else {
        res.status(404).send('Id não encontrado.');
      }
    } catch {
      res.status(500).send(err.message);
    }
  });
});

app.post('/grades?', function ({ body }, res) {
  fs.readFile(fileName, 'utf-8', (err, data) => {
    try {
      if (err) throw err;
      const file = JSON.parse(data);
      delete body.id;
      delete body.timestamp;
      const newGrade = {
        id: file.nextId++,
        ...body,
        timestamp: new Date(),
      };
      file.grades.push(newGrade);
      fs.writeFile(fileName, JSON.stringify(file), 'utf-8', (err) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.send(newGrade);
        }
      });
    } catch {
      res.status(500).send(err.message);
    }
  });
});

app.put('/grades?', function ({ body }, res) {
  fs.readFile(fileName, 'utf-8', (err, data) => {
    try {
      if (err) throw err;
      const file = JSON.parse(data);
      const newGrade = {
        ...body,
        timestamp: new Date(),
      };
      const index = file.grades.findIndex((grade) => grade.id === newGrade.id);
      if (index >= 0) {
        file.grades[index] = newGrade;
        fs.writeFile(fileName, JSON.stringify(file), 'utf-8', (err) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.send(newGrade);
          }
        });
      } else {
        res.status(404).send('Id não encontrado.');
      }
    } catch {
      res.status(500).send(err.message);
    }
  });
});

app.delete('/grades?/:id', function (req, res) {
  fs.readFile(fileName, 'utf-8', (err, data) => {
    try {
      if (err) throw err;
      const id = req.params.id;
      const file = JSON.parse(data);
      const index = file.grades.findIndex((grade) => grade.id === newGrade.id);
      if (index >= 0) {
        file.grades.splice(index, 1);
        fs.writeFile(fileName, JSON.stringify(file), 'utf-8', (err) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.end();
          }
        });
      } else {
        res.status(404).send('Id não encontrado.');
      }
    } catch {
      res.status(500).send(err.message);
    }
  });
});

app.listen(3000, function () {
  console.log('Servidor atendendo no endereço http://localhost:3000');
});
