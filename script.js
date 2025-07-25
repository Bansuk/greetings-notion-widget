const CONFIG = {
  params: {
    name: { default: '' },
    mode: { values: ['light', 'dark'], default: 'dark' },
    lang: { values: ['en', 'pt'], default: 'en' },
    hour: { values: ['12', '24'], default: '24' },
    holidays: { values: [true, false], default: true }
  },
  
  translations: {
    en: {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
      error: 'Error creating widget.<br/>Please generate a new link.',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    pt: {
      morning: 'Bom Dia',
      afternoon: 'Boa Tarde',
      evening: 'Boa Noite',
      error: 'Erro ao criar widget.<br/>Por favor, gere um novo link.',
      days: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
      months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    }
  }
};

class WidgetManager {
  constructor() {
    this.params = this.parseUrlParams();
    this.clockInterval = null;
    this.greetingInterval = null;
  }

  parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return Object.fromEntries(urlParams);
  }

  validateParams() {
    const { params } = CONFIG;
    
    for (const [key, value] of Object.entries(this.params)) {
      if (!(key in params)) {
        throw new Error(`Invalid parameter: ${key}`);
      }

      const config = params[key];
      
      if (config.values && !config.values.includes(value)) {
        throw new Error(`Invalid value for ${key}: ${value}. Allowed values: ${config.values.join(', ')}`);
      }
    }
  }

  parseValue(value, sample) {
    if (typeof sample === 'boolean') return value === 'true';
    return value;
  }

  getParamValue(key) {
    const config = CONFIG.params[key];
    if (!config) return undefined;

    const rawValue = this.params[key];
    return rawValue !== undefined ? this.parseValue(rawValue, config.values?.[0] ?? config.default) : config.default;
  }

  getPeriodOfDay() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  }

  setGreetingMessage() {
    const greetingElement = document.querySelector('.greeting');
    if (!greetingElement) {
      console.warn('Greeting element not found');
      return;
    }

    const name = this.getParamValue('name');
    const lang = this.getParamValue('lang');
    const period = this.getPeriodOfDay();
    
    const message = CONFIG.translations[lang][period];
    greetingElement.textContent = name ? `${message}, ${name}` : message;
  }

  formatTime(value) {
    return String(value).padStart(2, '0');
  }

  getCurrentDateTime() {
    const now = new Date();
    const lang = this.getParamValue('lang');
    const hourFormat = this.getParamValue('hour');
    const translations = CONFIG.translations[lang] || CONFIG.translations.en;

    const dayName = translations.days[now.getDay()];
    const day = now.getDate();
    const monthName = translations.months[now.getMonth()];
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = this.formatTime(now.getMinutes());
    const seconds = this.formatTime(now.getSeconds());

    let timeString;
    if (hourFormat === '12') {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      timeString = `${this.formatTime(hours)}:${minutes}:${seconds} ${ampm}`;
    } else timeString = `${this.formatTime(hours)}:${minutes}:${seconds}`;
    
    return {
      date: `${dayName}, ${day} ${monthName} ${year}`,
      time: timeString,
      fullDateTime: `${dayName}, ${day} ${monthName} ${year} - ${timeString}`
    };
  }

  updateDateTime() {
    const dateTimeElement = document.querySelector('.datetime');
    if (!dateTimeElement) {
      console.warn('DateTime element not found');
      return;
    }

    dateTimeElement.textContent = this.getCurrentDateTime().fullDateTime;
  }

  startClock() {
    this.updateDateTime();
    
    this.clockInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  startGreetingMessage() {
    this.setGreetingMessage();

    this.greetingInterval = setInterval(() => {
        this.setGreetingMessage();
    }, 1000 * 60 * 60)
  }

  setMode() {
    const bodyElement = document.body;
    const mode = this.getParamValue('mode');
    
    bodyElement.classList.remove('light', 'dark');
    bodyElement.classList.add(mode);
  }

  showError() {
    const container = document.querySelector('.container');
    if (!container) {
      console.error('Container element not found');
      return;
    }

    const lang = this.getParamValue('lang');
    const errorMessage = CONFIG.translations[lang]?.error || CONFIG.translations.en.error;
    container.innerHTML = `<h1 class="error">${errorMessage}</h1>`;
  }

  applySettings() {
    this.startGreetingMessage();
    this.setMode();
    this.startClock();
  }

  init() {
    try {
      this.validateParams();
      this.applySettings();
    } catch (error) {
      console.error('Widget initialization failed:', error.message);
      this.showError();
    }
  }
}

const widget = new WidgetManager();
widget.init();