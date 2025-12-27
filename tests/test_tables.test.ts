import { md } from './utils';

describe('Tables Tests', () => {
  const table = `<table>
    <tr>
        <th>Firstname</th>
        <th>Lastname</th>
        <th>Age</th>
    </tr>
    <tr>
        <td>Jill</td>
        <td>Smith</td>
        <td>50</td>
    </tr>
    <tr>
        <td>Eve</td>
        <td>Jackson</td>
        <td>94</td>
    </tr>
</table>`;

  const table_with_html_content = `<table>
    <tr>
        <th>Firstname</th>
        <th>Lastname</th>
        <th>Age</th>
    </tr>
    <tr>
        <td><b>Jill</b></td>
        <td><i>Smith</i></td>
        <td><a href="#">50</a></td>
    </tr>
    <tr>
        <td>Eve</td>
        <td>Jackson</td>
        <td>94</td>
    </tr>
</table>`;

  const table_with_paragraphs = `<table>
    <tr>
        <th>Firstname</th>
        <th><p>Lastname</p></th>
        <th>Age</th>
    </tr>
    <tr>
        <td><p>Jill</p></td>
        <td><p>Smith</p></td>
        <td><p>50</p></td>
    </tr>
    <tr>
        <td>Eve</td>
        <td>Jackson</td>
        <td>94</td>
    </tr>
</table>`;

  const table_with_linebreaks = `<table>
    <tr>
        <th>Firstname</th>
        <th>Lastname</th>
        <th>Age</th>
    </tr>
    <tr>
        <td>Jill</td>
        <td>Smith
        Jackson</td>
        <td>50</td>
    </tr>
    <tr>
        <td>Eve</td>
        <td>Jackson
        Smith</td>
        <td>94</td>
    </tr>
</table>`;

  const table_with_header_column = `<table>
    <tr>
        <th>Firstname</th>
        <th>Lastname</th>
        <th>Age</th>
    </tr>
    <tr>
        <th>Jill</th>
        <td>Smith</td>
        <td>50</td>
    </tr>
    <tr>
        <th>Eve</th>
        <td>Jackson</td>
        <td>94</td>
    </tr>
</table>`;

  const table_head_body = `<table>
    <thead>
        <tr>
            <th>Firstname</th>
            <th>Lastname</th>
            <th>Age</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Jill</td>
            <td>Smith</td>
            <td>50</td>
        </tr>
        <tr>
            <td>Eve</td>
            <td>Jackson</td>
            <td>94</td>
        </tr>
    </tbody>
</table>`;

  const table_head_body_missing_head = `<table>
    <thead>
        <tr>
            <td>Firstname</td>
            <td>Lastname</td>
            <td>Age</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Jill</td>
            <td>Smith</td>
            <td>50</td>
        </tr>
        <tr>
            <td>Eve</td>
            <td>Jackson</td>
            <td>94</td>
        </tr>
    </tbody>
</table>`;

  const table_head_body_multiple_head = `<table>
    <thead>
        <tr>
            <td>Creator</td>
            <td>Editor</td>
            <td>Server</td>
        </tr>
        <tr>
            <td>Operator</td>
            <td>Manager</td>
            <td>Engineer</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Bob</td>
            <td>Oliver</td>
            <td>Tom</td>
        </tr>
        <tr>
            <td>Thomas</td>
            <td>Lucas</td>
            <td>Ethan</td>
        </tr>
    </tbody>
</table>`;

  const table_missing_text = `<table>
    <thead>
        <tr>
            <th></th>
            <th>Lastname</th>
            <th>Age</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Jill</td>
            <td></td>
            <td>50</td>
        </tr>
        <tr>
            <td>Eve</td>
            <td>Jackson</td>
            <td>94</td>
        </tr>
    </tbody>
</table>`;

  const table_missing_head = `<table>
    <tr>
        <td>Firstname</td>
        <td>Lastname</td>
        <td>Age</td>
    </tr>
    <tr>
        <td>Jill</td>
        <td>Smith</td>
        <td>50</td>
    </tr>
    <tr>
        <td>Eve</td>
        <td>Jackson</td>
        <td>94</td>
    </tr>
</table>`;

  const table_body = `<table>
    <tbody>
        <tr>
            <td>Firstname</td>
            <td>Lastname</td>
            <td>Age</td>
        </tr>
        <tr>
            <td>Jill</td>
            <td>Smith</td>
            <td>50</td>
        </tr>
        <tr>
            <td>Eve</td>
            <td>Jackson</td>
            <td>94</td>
        </tr>
    </tbody>
</table>`;

  const table_with_caption = `TEXT<table>
    <caption>
        Caption
    </caption>
    <tbody><tr><td>Firstname</td>
            <td>Lastname</td>
            <td>Age</td>
        </tr>
    </tbody>
</table>`;

  const table_with_colspan = `<table>
    <tr>
        <th colspan="2">Name</th>
        <th>Age</th>
    </tr>
    <tr>
        <td colspan="1">Jill</td>
        <td>Smith</td>
        <td>50</td>
    </tr>
    <tr>
        <td>Eve</td>
        <td>Jackson</td>
        <td>94</td>
    </tr>
</table>`;

  const table_with_undefined_colspan = `<table>
    <tr>
        <th colspan="undefined">Name</th>
        <th>Age</th>
    </tr>
    <tr>
        <td colspan="-1">Jill</td>
        <td>Smith</td>
    </tr>
</table>`;

  const table_with_colspan_missing_head = `<table>
    <tr>
        <td colspan="2">Name</td>
        <td>Age</td>
    </tr>
    <tr>
        <td>Jill</td>
        <td>Smith</td>
        <td>50</td>
    </tr>
    <tr>
        <td>Eve</td>
        <td>Jackson</td>
        <td>94</td>
    </tr>
</table>`;

  describe('Basic Tables', () => {
    test('basic table', () => {
      expect(md(table)).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with HTML content', () => {
      expect(md(table_with_html_content)).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| **Jill** | *Smith* | [50](#) |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with paragraphs', () => {
      expect(md(table_with_paragraphs)).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with linebreaks', () => {
      expect(md(table_with_linebreaks)).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith Jackson | 50 |\n| Eve | Jackson Smith | 94 |\n\n');
    });

    test('table with header column', () => {
      expect(md(table_with_header_column)).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });
  });

  describe('Table Structure', () => {
    test('table with thead and tbody', () => {
      expect(md(table_head_body)).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with multiple header rows', () => {
      expect(md(table_head_body_multiple_head)).toBe('\n\n|  |  |  |\n| --- | --- | --- |\n| Creator | Editor | Server |\n| Operator | Manager | Engineer |\n| Bob | Oliver | Tom |\n| Thomas | Lucas | Ethan |\n\n');
    });

    test('table with missing header', () => {
      expect(md(table_head_body_missing_head)).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with missing text', () => {
      expect(md(table_missing_text)).toBe('\n\n|  | Lastname | Age |\n| --- | --- | --- |\n| Jill |  | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table without th elements', () => {
      expect(md(table_missing_head)).toBe('\n\n|  |  |  |\n| --- | --- | --- |\n| Firstname | Lastname | Age |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with only tbody', () => {
      expect(md(table_body)).toBe('\n\n|  |  |  |\n| --- | --- | --- |\n| Firstname | Lastname | Age |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with caption', () => {
      expect(md(table_with_caption)).toBe('TEXT\n\nCaption\n\n|  |  |  |\n| --- | --- | --- |\n| Firstname | Lastname | Age |\n\n');
    });
  });

  describe('Table Colspan', () => {
    test('table with colspan', () => {
      expect(md(table_with_colspan)).toBe('\n\n| Name | | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with undefined colspan', () => {
      expect(md(table_with_undefined_colspan)).toBe('\n\n| Name | Age |\n| --- | --- |\n| Jill | Smith |\n\n');
    });

    test('table with colspan and missing header', () => {
      expect(md(table_with_colspan_missing_head)).toBe('\n\n|  |  |  |\n| --- | --- | --- |\n| Name | | Age |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });
  });

  describe('Table Inference', () => {
    test('table with inferred header', () => {
      expect(md(table, { table_infer_header: true })).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with HTML content and inferred header', () => {
      expect(md(table_with_html_content, { table_infer_header: true })).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| **Jill** | *Smith* | [50](#) |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with paragraphs and inferred header', () => {
      expect(md(table_with_paragraphs, { table_infer_header: true })).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with linebreaks and inferred header', () => {
      expect(md(table_with_linebreaks, { table_infer_header: true })).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith Jackson | 50 |\n| Eve | Jackson Smith | 94 |\n\n');
    });

    test('table with header column and inferred header', () => {
      expect(md(table_with_header_column, { table_infer_header: true })).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with thead and tbody and inferred header', () => {
      expect(md(table_head_body, { table_infer_header: true })).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with multiple header rows and inferred header', () => {
      expect(md(table_head_body_multiple_head, { table_infer_header: true })).toBe('\n\n| Creator | Editor | Server |\n| --- | --- | --- |\n| Operator | Manager | Engineer |\n| Bob | Oliver | Tom |\n| Thomas | Lucas | Ethan |\n\n');
    });

    test('table with missing header and inferred header', () => {
      expect(md(table_head_body_missing_head, { table_infer_header: true })).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with missing text and inferred header', () => {
      expect(md(table_missing_text, { table_infer_header: true })).toBe('\n\n|  | Lastname | Age |\n| --- | --- | --- |\n| Jill |  | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table without th elements and inferred header', () => {
      expect(md(table_missing_head, { table_infer_header: true })).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with only tbody and inferred header', () => {
      expect(md(table_body, { table_infer_header: true })).toBe('\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with caption and inferred header', () => {
      expect(md(table_with_caption, { table_infer_header: true })).toBe('TEXT\n\nCaption\n\n| Firstname | Lastname | Age |\n| --- | --- | --- |\n\n');
    });

    test('table with colspan and inferred header', () => {
      expect(md(table_with_colspan, { table_infer_header: true })).toBe('\n\n| Name | | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });

    test('table with undefined colspan and inferred header', () => {
      expect(md(table_with_undefined_colspan, { table_infer_header: true })).toBe('\n\n| Name | Age |\n| --- | --- |\n| Jill | Smith |\n\n');
    });

    test('table with colspan and missing header and inferred header', () => {
      expect(md(table_with_colspan_missing_head, { table_infer_header: true })).toBe('\n\n| Name | | Age |\n| --- | --- | --- |\n| Jill | Smith | 50 |\n| Eve | Jackson | 94 |\n\n');
    });
  });
});
