import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Rectangle,
} from "recharts";
import { Chart } from "react-google-charts";

const StatsComponent = ({
  licitaciones,
  valoraciones,
  participaciones,
  empresas,
}) => {
  const [empresaData, setEmpresaData] = useState([]);
  const [sortBy, setSortBy] = useState("participacionesCount");
  const [sortOrder, setSortOrder] = useState("desc");

  const sortEmpresaData = (data) => {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      if (a[sortBy] === b[sortBy]) {
        if (sortBy === "participacionesCount") {
          return sortOrder === "asc"
            ? a.adjudicatarioCount - b.adjudicatarioCount
            : b.adjudicatarioCount - a.adjudicatarioCount;
        }
        return sortOrder === "asc"
          ? a.participacionesCount - b.participacionesCount
          : b.participacionesCount - a.participacionesCount;
      }
      return sortOrder === "asc"
        ? a[sortBy] - b[sortBy]
        : b[sortBy] - a[sortBy];
    });
    return sortedData.slice(0, 20);
  };

  useEffect(() => {
    if (empresas.length > 0 && participaciones.length > 0) {
      const aggregatedData = empresas.map((empresa) => {
        const participacionesCount = participaciones.filter(
          (participacion) =>
            participacion.id_empresa === empresa.id_empresa &&
            licitaciones.some(
              (licitacion) =>
                licitacion.id_licitacion === participacion.id_licitacion
            )
        ).length;
        const adjudicatarioCount = licitaciones.filter(
          (licitacion) =>
            licitacion.adjudicatario.id_empresa === empresa.id_empresa
        ).length;
        const expulsadaCount = participaciones.filter(
          (participacion) =>
            participacion.excluida === true &&
            participacion.id_empresa === empresa.id_empresa &&
            licitaciones.some(
              (licitacion) =>
                licitacion.id_licitacion === participacion.id_licitacion
            )
        ).length;
        return {
          id: empresa.id_empresa,
          name: empresa.nombre_empresa,
          participacionesCount,
          adjudicatarioCount,
          expulsadaCount,
        };
      });
      setEmpresaData(sortEmpresaData(aggregatedData));
    }
  }, [empresas, participaciones, licitaciones, sortBy, sortOrder]);

  const aggregateData = () => {
    const estados = {};
    const procedimientos = {};
    const tramitaciones = {};
    const unidades = {};
    const importe = { total: 0, count: 0 };
    const tiposContrato = {};

    licitaciones.forEach((licitacion) => {
      const estado = licitacion.estado.estado;
      estados[estado] = (estados[estado] || 0) + 1;

      const procedimiento = licitacion.procedimiento.nombre_procedimiento;
      procedimientos[procedimiento] = (procedimientos[procedimiento] || 0) + 1;

      const tramitacion = licitacion.tramitacion.nombre_tramitacion;
      tramitaciones[tramitacion] = (tramitaciones[tramitacion] || 0) + 1;

      const tipoContrato = licitacion.tipo_contrato.nombre_tipo_contrato.trim();
      tiposContrato[tipoContrato] = (tiposContrato[tipoContrato] || 0) + 1;

      const unidad = licitacion.unidad_encargada;
      unidades[unidad] = (unidades[unidad] || 0) + 1;

      importe.total += parseFloat(licitacion.importe_sin_impuestos) || 0;
      importe.count += 1;
    });

    return {
      estados,
      procedimientos,
      tramitaciones,
      unidades,
      importe,
      tiposContrato,
    };
  };

  const {
    estados,
    procedimientos,
    tramitaciones,
    unidades,
    importe,
    tiposContrato,
  } = aggregateData();

  const empresaChartData = empresaData.map((empresa) => ({
    name: empresa.name,
    value: empresa.participacionesCount,
    adjudicatarioCount: empresa.adjudicatarioCount,
    expulsadaCount: empresa.expulsadaCount,
  }));

  const estadoData = Object.keys(estados).map((key) => ({
    name: key,
    value: estados[key],
  }));
  const procedimientoData = Object.keys(procedimientos).map((key) => ({
    name: key,
    value: procedimientos[key],
  }));
  const tramitacionData = Object.keys(tramitaciones).map((key) => ({
    name: key,
    value: tramitaciones[key],
  }));
  const unidadData = Object.keys(unidades).map((key) => ({
    name: key,
    value: unidades[key],
  }));
  const tiposData = Object.keys(tiposContrato).map((key) => ({
    name: key,
    value: tiposContrato[key],
  }));

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

  const tooltipStyles = {
    backgroundColor: "#333",
    color: "#fff",
    border: "1px solid #ccc",
    padding: "10px",
    borderRadius: "5px",
  };

  const getNumberOfParticipations = (idLicitacion) => {
    let numOfertas = 0;
    participaciones.forEach((participacion) => {
      if (participacion.id_licitacion === idLicitacion) {
        numOfertas += 1;
      }
    });
    return numOfertas;
  };

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

  const calculateParticipationsPerRange = (licitaciones) => {
    const rangeCounts = ranges.map((range) => ({
      range: range.label,
      totalParticipations: 0,
      count: 0,
      averageParticipations: 0,
    }));

    licitaciones.forEach((licitacion) => {
      const contractValue = licitacion.valor_estimado;
      const participations = getNumberOfParticipations(
        licitacion.id_licitacion
      );
      for (let i = 0; i < ranges.length; i++) {
        if (contractValue >= ranges[i].min && contractValue < ranges[i].max) {
          rangeCounts[i].totalParticipations += participations;
          rangeCounts[i].count += 1;
          break;
        }
      }
    });

    rangeCounts.forEach((range) => {
      range.averageParticipations =
        range.count > 0 ? range.totalParticipations / range.count : 0;
    });

    return rangeCounts;
  };
  const bajaAdjudicatario = (licitacion) => {
    const importe = licitacion.importe_sin_impuestos;
    const adjudicatarioParticipacion = participaciones.find(
      (participacion) =>
        participacion.id_licitacion == licitacion.id_licitacion &&
        participacion.id_empresa == licitacion.adjudicatario.id_empresa
    );
    const baja =
      ((importe - adjudicatarioParticipacion.importe_ofertado_sin_iva) /
        importe) *
      100;

    return baja;
  };
  const bajasPorRango = (licitaciones) => {
    const rangeBajas = ranges.map((range) => ({
      range: range.label,
      totalBajas: 0,
      count: 0,
      bajaMedia: 0,
    }));

    licitaciones.forEach((licitacion) => {
      const contractValue = licitacion.importe_sin_impuestos;
      const baja = bajaAdjudicatario(licitacion);
      for (let i = 0; i < ranges.length; i++) {
        if (contractValue >= ranges[i].min && contractValue < ranges[i].max) {
          rangeBajas[i].totalBajas += baja;
          rangeBajas[i].count += 1;
          break;
        }
      }
    });

    rangeBajas.forEach((range) => {
      range.bajaMedia = range.count > 0 ? range.totalBajas / range.count : 0;
    });

    return rangeBajas;
  };

  const participationsPerRange = calculateParticipationsPerRange(licitaciones);
  const histogramData = [];
  participationsPerRange.forEach((range) => {
    histogramData.push({ name: range.range, ml: range.averageParticipations });
  });
  const bajasPorRangoValor = bajasPorRango(licitaciones);
  const bajasData = [];
  bajasPorRangoValor.forEach((range) => {
    bajasData.push({ name: range.range, mb: range.bajaMedia });
  });
  console.log(bajasData);
  const numCriterios = (idLicitacion) => {
    const participacionesLicit = participaciones.filter(
      (participacion) => participacion.id_licitacion == idLicitacion
    );
    const participacionIds = participacionesLicit.map(
      (participacion) => participacion.id_participacion
    );

    const valoracionesFiltered = valoraciones.filter((valoracion) =>
      participacionIds.includes(valoracion.id_participacion)
    );
    const uniqueCriterios = new Set(
      valoracionesFiltered.map(
        (valoracion) => valoracion.id_criterio.id_criterio
      )
    );
    return uniqueCriterios.size == 1 ? "Único criterio" : "Varios Criterios";
  };
  const criteriosCounts = licitaciones.reduce(
    (acc, licitacion) => {
      const criterio = numCriterios(licitacion.id_licitacion);
      acc[criterio] += 1;
      return acc;
    },
    { "Único criterio": 0, "Varios Criterios": 0 }
  );

  const criteriosData = Object.keys(criteriosCounts).map((key) => ({
    name: key,
    value: criteriosCounts[key],
  }));
  return (
    <div>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <h3>
          Importe Total:{" "}
          {importe.total.toLocaleString("es-ES", {
            style: "currency",
            currency: "EUR",
          })}
        </h3>
        <h4>
          Importe Medio:{" "}
          {(importe.total / importe.count).toLocaleString("es-ES", {
            style: "currency",
            currency: "EUR",
          })}
        </h4>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3>Procedimientos</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={procedimientoData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {procedimientoData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
        <div>
          <h3>Tramitaciones</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={tramitacionData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {tramitacionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
        <div>
          <h3>Tipo de Contrato</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={tiposData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {tiposData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
        <div>
          <h3>Número de Criterios</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={criteriosData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {procedimientoData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
        <ResponsiveContainer
          width="100%"
          height={empresaChartData.length * 50 + 100}
          className={"mb-5"}
        >
          <div style={{ marginBottom: "10px" }}>
            <label>Ordenar Por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ marginLeft: "10px" }}
            >
              <option value="participacionesCount">Participaciones</option>
              <option value="adjudicatarioCount">Adjudicaciones</option>
              <option value="expulsadaCount">Exclusiones</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "Descendente" : "Ascendente"}
            </button>
          </div>
          <h3>Top Empresas</h3>
          <BarChart
            layout="vertical"
            data={empresaChartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={400} />
            <Tooltip contentStyle={tooltipStyles} />
            <Legend />
            <Bar dataKey="value" name={"Participaciones"} fill={COLORS[0]} />
            <Bar
              dataKey="adjudicatarioCount"
              name={"Adjudicaciones"}
              fill={COLORS[1]}
            />
            <Bar
              dataKey="expulsadaCount"
              name={"Exclusiones"}
              fill={COLORS[2]}
            />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={500} className={"mt-5"}>
          <BarChart
            data={histogramData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="ml"
              fill={COLORS[5]}
              name={"Número Medio de Licitadores"}
            />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={500} className={"mt-5"}>
          <BarChart
            data={bajasData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="mb"
              fill={COLORS[6]}
              name={"Valor Medio de la Baja del Adjudicatario"}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsComponent;
