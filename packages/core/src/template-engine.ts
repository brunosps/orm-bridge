import Handlebars from 'handlebars';
import { DatabaseType, ParameterStyle } from './types';

export class TemplateEngine {
  private static instance: TemplateEngine;
  
  private constructor() {
    this.registerHelpers();
  }
  
  static getInstance(): TemplateEngine {
    if (!TemplateEngine.instance) {
      TemplateEngine.instance = new TemplateEngine();
    }
    return TemplateEngine.instance;
  }
  
  private registerHelpers() {
    // Helper para escapar valores especiais
    Handlebars.registerHelper('escape', (value: any) => {
      if (typeof value === 'string') {
        return value.replace(/'/g, "''");
      }
      return value;
    });
  }
  
  compile(template: string): HandlebarsTemplateDelegate {
    return Handlebars.compile(template);
  }
  
  /**
   * Converte parâmetros nomeados (:param) para o estilo apropriado do ORM
   */
  convertParameterStyle(
    sql: string,
    params: Record<string, any>,
    targetStyle: ParameterStyle
  ): { sql: string; params: any } {
    switch (targetStyle) {
      case ParameterStyle.NAMED:
        // Mantém :param (Sequelize)
        return { sql, params };
        
      case ParameterStyle.POSITIONAL:
        // Converte para $1, $2, $3 (Prisma/PostgreSQL)
        return this.convertToPositional(sql, params);
        
      case ParameterStyle.QUESTION:
        // Converte para ? (MySQL)
        return this.convertToQuestion(sql, params);
        
      default:
        return { sql, params };
    }
  }
  
  private convertToPositional(sql: string, params: Record<string, any>): { sql: string; params: any[] } {
    const paramNames: string[] = [];
    const paramValues: any[] = [];
    
    // Encontra todos os :param no SQL
    const paramMatches = sql.match(/:(\w+)/g) || [];
    const uniqueParams = Array.from(new Set(paramMatches));
    
    uniqueParams.forEach((match, index) => {
      const paramName = match.substring(1); // Remove o ':'
      paramNames.push(paramName);
      paramValues.push(params[paramName]);
    });
    
    // Substitui :param por $1, $2, etc
    let convertedSql = sql;
    paramNames.forEach((paramName, index) => {
      const regex = new RegExp(`:${paramName}\\b`, 'g');
      convertedSql = convertedSql.replace(regex, `$${index + 1}`);
    });
    
    return { sql: convertedSql, params: paramValues };
  }
  
  private convertToQuestion(sql: string, params: Record<string, any>): { sql: string; params: any[] } {
    const paramValues: any[] = [];
    
    // Encontra todos os :param no SQL
    const paramMatches = sql.match(/:(\w+)/g) || [];
    
    // Mantém a ordem de aparição dos parâmetros
    paramMatches.forEach((match) => {
      const paramName = match.substring(1);
      paramValues.push(params[paramName]);
    });
    
    // Substitui todos :param por ?
    const convertedSql = sql.replace(/:\w+/g, '?');
    
    return { sql: convertedSql, params: paramValues };
  }
}
