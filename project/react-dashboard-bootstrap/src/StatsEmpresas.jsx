import React, { useState, useEffect } from "react";
import { Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { parse, compareAsc } from "date-fns";
import { es } from "date-fns/locale";
import "./TablasStyle.css";
import EmpresaTableByYear from "./EmpresaTableByYear";
import Table from "react-bootstrap/Table";
import Accordion from "react-bootstrap/Accordion";
const StatsEmpresas = ({ valoraciones, participaciones, empresas }) => {
  const [empresaData, setEmpresaData] = useState([]);
  const [sortBy, setSortBy] = useState("participacionesCount");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pymeStats, setPymeStats] = useState({});
  const [licitaciones, setLicitaciones] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/licitaciones/")
      .then((response) => response.json())
      .then((data) => {
        setLicitaciones(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);
  useEffect(() => {
    // Calculate PYME stats
    const calculatePymeStats = () => {
      const pymeCount = empresas.filter(
        (empresa) => empresa.pyme === true
      ).length;
      const noPymeCount = empresas.filter(
        (empresa) => empresa.pyme === false
      ).length;
      const unknownCount = empresas.filter(
        (empresa) => empresa.pyme === null
      ).length;

      return { pymeCount, noPymeCount, unknownCount };
    };

    // Set state with calculated stats
    setPymeStats(calculatePymeStats());
  }, [empresas]);

  // Data for the pie chart
  const pieChartData = [
    { name: "Sí", value: pymeStats.pymeCount || 0 },
    { name: "No", value: pymeStats.noPymeCount || 0 },
    { name: "Desconocido", value: pymeStats.unknownCount || 0 },
  ];

  // Helper function to aggregate data

  const COLORS = [
    "#d0848d",
    "#82ca9d",
    "#ffc658",
    "#84d8c6",
    "#c684d8",
    "#8884d8",
    "#d8a384",
    "#B6E2DD",
    "#C8DDBB",
    "#E9E5AF",
    "#FBDF9D",
    "#FBC99D",
    "#FBB39D",
    "#FBA09D",
    "#ffd5c2",
    "#588b8b",
    "#ff6f59",
    "#b01041",
    "#223f5a",
  ];

  const startYear = 2019;
  const currentYear = new Date().getFullYear() - 1;
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const computeMetricsByYear = () => {
    const metricsByYear = years.map((year) => {
      const metrics = empresas.map((empresa) => {
        // Filter participaciones based on the empresa and licitaciones with adjudicatario
        const participacionesYear = participaciones.filter((p) => {
          const licitacion = licitaciones.find(
            (l) => l.id_licitacion == p.id_licitacion && l.adjudicatario
          );
          return (
            p.id_empresa == empresa.id_empresa &&
            licitacion &&
            parse(licitacion.plazo_presentacion, "dd/MM/yyyy", new Date(), {
              locale: es,
            }).getFullYear() === year
          );
        });

        const numParticipaciones = participacionesYear.length;

        // Filter licitaciones where the empresa is the adjudicatario and adjudicatario exists
        const numAdjudicaciones = licitaciones.filter(
          (l) =>
            l.adjudicatario?.id_empresa == empresa.id_empresa &&
            parse(l.plazo_presentacion, "dd/MM/yyyy", new Date(), {
              locale: es,
            }).getFullYear() == year
        ).length;

        // Calculate percentage only for valid licitaciones
        const percentage =
          numParticipaciones > 0
            ? (participacionesYear.reduce((acc, p) => {
                const licitacion = licitaciones.find(
                  (l) => l.id_licitacion === p.id_licitacion && l.adjudicatario
                );
                return (
                  acc +
                  (licitacion.importe_sin_impuestos -
                    p.importe_ofertado_sin_iva) /
                    licitacion.importe_sin_impuestos
                );
              }, 0) /
                numParticipaciones) *
              100
            : 0;

        return {
          name: empresa.nombre_empresa,
          year: year,
          participations: numParticipaciones,
          wins: numAdjudicaciones,
          percentage: percentage.toFixed(2), // Keeping two decimal places for percentage
        };
      });

      return { year, metrics };
    });

    console.log(metricsByYear);
    return metricsByYear;
  };

  // Compute the data for the chart
  const metricsByYear = computeMetricsByYear();

  const ranges = [
    { min: 0, max: 100000, label: "0 - 100,000" },
    { min: 100000, max: 500000, label: "100,000 - 500,000" },
    { min: 500000, max: 1000000, label: "500,000 - 1,000,000" },
    { min: 1000000, max: 2000000, label: "1,000,000 - 2,000,000" },
    { min: 2000000, max: 3000000, label: "2,000,000 - 3,000,000" },
    { min: 3000000, max: 4000000, label: "3,000,000 - 4,000,000" },
    { min: 4000000, max: 5000000, label: "4,000,000 - 5,000,000" },
    { min: 5000000, max: 6000000, label: "5,000,000 - 6,000,000" },
    { min: 6000000, max: 7000000, label: "6,000,000 - 7,000,000" },
    { min: 7000000, max: Infinity, label: "7,000,000+" },
  ];
  const computeMetricsByRange = () => {
    const metricsByRange = empresas.map((empresa) => {
      const totalParticipations = participaciones.filter(
        (p) => p.id_empresa === empresa.id_empresa
      ).length;
      const totalWins = licitaciones.filter(
        (l) => l.adjudicatario?.id_empresa === empresa.id_empresa
      ).length;
      const totalSuccessPercentage =
        totalParticipations > 0 ? (totalWins / totalParticipations) * 100 : 0;
      const metrics = ranges.map((range) => {
        const participacionesInRange = participaciones.filter((p) => {
          const licitacion = licitaciones.find(
            (l) => l.id_licitacion === p.id_licitacion
          );
          return (
            p.id_empresa === empresa.id_empresa &&
            licitacion &&
            p.importe_ofertado_sin_iva >= range.min &&
            p.importe_ofertado_sin_iva < range.max
          );
        });

        const numParticipations = participacionesInRange.length;
        const numWins = licitaciones.filter((l) => {
          const participacion = participaciones.find(
            (p) =>
              p.id_licitacion == l.id_licitacion &&
              p.id_empresa == empresa.id_empresa
          );
          return (
            l.adjudicatario?.id_empresa == empresa.id_empresa &&
            participacion &&
            participacion.importe_ofertado_sin_iva >= range.min &&
            participacion.importe_ofertado_sin_iva < range.max
          );
        }).length;

        const successPercentage =
          numParticipations > 0 ? (numWins / numParticipations) * 100 : 0;

        return {
          rangeLabel: range.label,
          successPercentage: successPercentage.toFixed(2),
        };
      });

      return {
        empresa: empresa.nombre_empresa,
        totalSuccessPercentage: totalSuccessPercentage.toFixed(2),
        metrics,
      };
    });

    return metricsByRange;
  };

  // Example usage
  const metricsByRange = computeMetricsByRange();
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3>Empresas PYME</h3>

          <PieChart width={400} height={400}>
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
      <Accordion className="ms-3 me-3" defaultActiveKey="0" alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            Baja Media, Adjudicaciones y Participaciones de cada Empresa por año
          </Accordion.Header>
          <Accordion.Body>
            <div
              className="border ms-3 me-3"
              style={{
                overflowX: "scroll",
                overflowY: "scroll",
                height: "700px",
              }}
              width="100%"
            >
              <Table striped bordered hover>
                <thead className="sticky-top">
                  <tr>
                    <th>Empresa</th>
                    {years.map((year) => (
                      <th colSpan={3} key={year}>
                        {year}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th></th>
                    {years.map((year) => (
                      <>
                        <th key={`${year}-baja`} style={{ fontSize: "12px" }}>
                          Baja Media
                        </th>
                        <th
                          key={`${year}-adjudicaciones`}
                          style={{ fontSize: "12px" }}
                        >
                          Adjudicaciones
                        </th>
                        <th
                          key={`${year}-participaciones`}
                          style={{ fontSize: "12px" }}
                        >
                          Participaciones
                        </th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((empresa) => (
                    <tr key={empresa.id_empresa}>
                      <td>{empresa.nombre_empresa}</td>
                      {years.map((year) => {
                        const metrics = metricsByYear.find(
                          (m) => m.year === year
                        ).metrics;
                        const empresaMetrics = metrics.find(
                          (m) => m.name === empresa.nombre_empresa
                        );

                        return (
                          <React.Fragment key={year}>
                            <td>
                              {empresaMetrics
                                ? empresaMetrics.percentage
                                : "N/A"}
                            </td>
                            <td>
                              {empresaMetrics ? empresaMetrics.wins : "N/A"}
                            </td>
                            <td>
                              {empresaMetrics
                                ? empresaMetrics.participations
                                : "N/A"}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            Porcentaje de éxito de cada empresa por tamaño de contrato
          </Accordion.Header>
          <Accordion.Body>
            <div
              className="border ms-3 me-3"
              style={{
                overflowX: "scroll",
                overflowY: "scroll",
                height: "700px",
              }}
              width="100%"
            >
              <Table striped bordered hover>
                <thead className="sticky-top">
                  <tr>
                    <th>Empresa</th>
                    <th>Total</th>
                    {ranges.map((range) => (
                      <th key={range.label}>{range.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metricsByRange.map((empresaMetrics) => (
                    <tr key={empresaMetrics.empresa}>
                      <td>{empresaMetrics.empresa}</td>
                      <td>{empresaMetrics.totalSuccessPercentage}%</td>
                      {empresaMetrics.metrics.map((metric) => (
                        <td key={metric.rangeLabel}>
                          {metric.successPercentage}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default StatsEmpresas;
