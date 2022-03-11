module.exports = {
  tableLayout: false,
  purge: ['./src/**/*.html', './src/**/*.js', './src/**/*.svelte'],
  darkMode: false,
  theme: {
    extend: {
      lineHeight: {
        16: '4rem',
      },
      colors: {
        green: {
          550: '#429383',
        },
        blue: {
          350: '#1DA1F2',
          550: '#3A83A3',
        },
        gray: {
          350: '#AAAAAA',
          370: '#A0A4A8',
          650: '#3E3E3E',
        },
        blue: {
          'light': '#ecf2fe',
          1: '#1a75ff',
          2: '#097fff',
          3: '#035cbb',
        },
        dark: {
          1: '#222222',
        },
        beige: {
          1: '#ccc',
          2: '#DAE2EC',
          3: '#bcc7d4',
          4: '#f7f7f7',
          5: '#fcfcfc',
          6: '#ebebeb',
          7: '#ffeeee',
          8: '#e7effa',
          9: '#f6f9ff',
          10: '#d6d6d6',
        },
        red: {
          1: '#ee0000',
        },
        yellow: {
          1: '#fff2c7',
          2: '#523602',
        },
        green: {
          1: '#cbffd3',
          2: '#21612b',
        },
      },
      maxWidth: {
        '4/5': 'calc(100% / 5 * 4)',
        '2/3': '66.67%',
        25: '6.25rem', // 100px
        '37.5': '9.375rem', // 150px
        42: '10.5rem', // 168px
        48: '12rem', // 192px
        52.5: '13.125rem', // 210px
        60: '15rem', // 240px
        80: '20rem', // 320px
        '112.5': '28.125rem', // 450px
        '137.5': '34.375rem', // 550px
        144: '36rem', // 576px
        183: '45.75rem', // 732px
        200: '50rem', // 800px
        250: '62.5rem', // 1000px
        'inherit': 'inherit'
      },
      maxHeight: {
        '2/3': '66.67%',
        '5/6': '83.33%',
        25: '6.25rem', // 100px
      },
      minWidth: {
        25: '6.25rem', // 100px
        72: '18rem', // 288px
      },
      minHeight: {
        8: '2rem',
        22: '5.5rem', // 88px
        32: '8rem', // 128px
      },
      width: {
        '7.5': '1.875rem', // 30px
        15: '3.75rem',
        18: '4.5rem',
        '30.5': '7.625rem', // 122px
        '37.5': '9.375rem', // 150px
        137: '34.25rem',// 548px
        'fit-content': 'fit-content',
        'icon-describe-desk': 'calc(100% - 1rem - 0.75rem)',
        'title-width': 'calc(100% - 1.5rem - 0.75rem)',
        'inherit': 'inherit',
      },
      height: {
        'fit-content': 'fit-content',
        15: '3.75rem',
        18: '4.5rem'
      },
      padding: {
        '0.75': '0.1875rem', // 3px
        '4.5': '1.125rem', // 18px
        18: '4.5rem', // 72px
        22: '5.5rem', // 88px
        34: '8.5rem', // 136px
      },
      margin: {
        '12.5': '3.125rem', // 50px
      },
      inset: {
        15: '3.75rem', // 60px
        '-25': '-6.25rem', // -100px
        '-29': '-7.25rem', // -116px
      },
      zIndex: {
        '100': 100,
      },
      borderRadius: {
        25: '6.25rem', // 100px
      },
      outline: {
        green: ['2px solid #429383', '-6px'],
      },
      fontFamily: {
        poppins: ['Poppins'],
        inter: ['Inter'],
        monserrat: ['Montserrat'],
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['checked'],
      borderColor: ['checked'],
      opacity: ['disabled'],
    },
  },
  plugins: [],
};
