import SensorData, { ISensorData, ISensorAlert } from "../models/SensorData";

class AlertService {
  // VERIFICA OS DADOS DOS SENSORES E GERA ALERTAS SE NECESSÁRIO
  async checkAlerts(): Promise<ISensorData[]> {
    const sensors = await SensorData.find();
    const updatedSensors: ISensorData[] = [];

    // Define os critérios de alerta
    const bulkOps = sensors
      .map((sensor) => {
        const newAlerts: ISensorAlert[] = [];

        // Alerta de temperatura
        if (sensor.temperature && sensor.temperature > 30) {
          newAlerts.push({
            type: "high_temp",
            value: sensor.temperature,
            threshold: 30,
            isActive: true,
            timestamp: new Date(),
          });
        }
        // Alerta de umidade do ar
        if (sensor.airHumidity && sensor.airHumidity > 80) {
          newAlerts.push({
            type: "high_humidity",
            value: sensor.airHumidity,
            threshold: 80,
            isActive: true,
            timestamp: new Date(),
          });
        }
        // Alerta de umidade do solo
        if (sensor.soilHumidity && sensor.soilHumidity > 70) {
          newAlerts.push({
            type: "low_humidity", // ou "high_humidity_soil" se preferir diferenciar
            value: sensor.soilHumidity,
            threshold: 70,
            isActive: true,
            timestamp: new Date(),
          });
        }

        // Se houver novos alertas, prepara a operação de atualização
        if (newAlerts.length > 0) {
          updatedSensors.push(sensor);
          return {
            updateOne: {
              filter: { _id: sensor._id },
              update: { $push: { alerts: { $each: newAlerts } } },
            },
          };
        }

        return null;
      })
      .filter(Boolean);

    // Executa as operações em lote
    if (bulkOps.length > 0) {
      await SensorData.bulkWrite(bulkOps as any);
    }

    return updatedSensors;
  }

  // RETORNA OS SENSORES QUE TÊM ALERTAS ATIVOS
  async getSensorsWithAlerts(): Promise<ISensorData[]> {
    return SensorData.find({ "alerts.isActive": true });
  }
}

export default new AlertService();
