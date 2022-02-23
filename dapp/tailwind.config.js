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
      },
      maxWidth: {
        '4/5': 'calc(100% / 5 * 4)',
        '2/3': '66.67%',
        48: '12rem', // 192px
        52.5: '13.125rem', // 210px
        60: '15rem', // 240px
      },
      maxHeight: {
        '2/3': '66.67%',
        '5/6': '83.33%',
      },
      minWidth: {
        25: '6.25rem', // 100px
        72: '18rem', // 288px
      },
      minHeight: {
        8: '2rem',
      },
      width: {
        'fit-content': 'fit-content',
        15: '3.75rem',
        'icon-describe-desk': 'calc(100% - 1rem - 0.75rem)',
      },
      height: {
        'fit-content': 'fit-content',
        15: '3.75rem',
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
